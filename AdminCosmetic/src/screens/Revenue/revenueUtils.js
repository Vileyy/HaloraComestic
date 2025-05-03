import { getDatabase, ref, onValue } from "firebase/database";

// === 1. Tổng quan doanh thu ===
export const getRevenueStats = async (callback) => {
  const db = getDatabase();
  const usersRef = ref(db, "users");

  return new Promise((resolve) => {
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const now = new Date();

      let revenueToday = 0;
      let revenueMonth = 0;
      let revenueYear = 0;
      let totalProductsSold = 0;

      Object.values(usersData || {}).forEach((user) => {
        if (user.orders) {
          Object.values(user.orders).forEach((order) => {
            if (order.status === "delivered") {
              const orderDate = new Date(order.createdAt);
              const total = order.total;

              if (orderDate.toDateString() === now.toDateString()) {
                revenueToday += total;
              }

              if (
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
              ) {
                revenueMonth += total;
              }

              if (orderDate.getFullYear() === now.getFullYear()) {
                revenueYear += total;
              }

              if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item) => {
                  totalProductsSold += item.quantity;
                });
              }
            }
          });
        }
      });

      const result = {
        revenueToday,
        revenueMonth,
        revenueYear,
        totalProductsSold,
      };

      callback(result);
      resolve(result);
    });
  });
};

// === 2. Doanh thu theo khoảng thời gian (chart) với hỗ trợ nhiều loại thời gian ===
export const getRevenueByPeriod = async (
  startDate,
  endDate,
  callback,
  periodType = "day"
) => {
  const db = getDatabase();
  const usersRef = ref(db, "users");

  // Xác định cách nhóm dữ liệu dựa trên loại thời gian
  const getGroupKey = (date) => {
    if (periodType === "day") {
      return date.toISOString().split("T")[0]; // YYYY-MM-DD
    } else if (periodType === "month") {
      return `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
    } else if (periodType === "year") {
      return `${date.getFullYear()}`; // YYYY
    }
  };

  const getDisplayLabel = (key) => {
    if (periodType === "day") {
      const date = new Date(key);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    } else if (periodType === "month") {
      const [year, month] = key.split("-");
      const monthNames = [
        "Th1",
        "Th2",
        "Th3",
        "Th4",
        "Th5",
        "Th6",
        "Th7",
        "Th8",
        "Th9",
        "Th10",
        "Th11",
        "Th12",
      ];
      return `${monthNames[parseInt(month) - 1]}`;
    } else if (periodType === "year") {
      return key;
    }
  };

  // Tạo các nhóm dữ liệu trống
  const revenueMap = new Map();
  const dateArray = [];

  // Tạo các nhóm dữ liệu dựa trên loại thời gian và khoảng thời gian
  if (periodType === "day") {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = getGroupKey(currentDate);
      dateArray.push(dateKey);
      revenueMap.set(dateKey, 0);
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
  } else if (periodType === "month") {
    let currentDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1
    );
    while (currentDate <= endDate) {
      const dateKey = getGroupKey(currentDate);
      dateArray.push(dateKey);
      revenueMap.set(dateKey, 0);
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    }
  } else if (periodType === "year") {
    for (
      let year = startDate.getFullYear();
      year <= endDate.getFullYear();
      year++
    ) {
      const dateKey = String(year);
      dateArray.push(dateKey);
      revenueMap.set(dateKey, 0);
    }
  }

  return new Promise((resolve) => {
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();

      Object.values(usersData || {}).forEach((user) => {
        if (user.orders) {
          Object.values(user.orders).forEach((order) => {
            if (order.status === "delivered") {
              const orderDate = new Date(order.createdAt);
              if (orderDate >= startDate && orderDate <= endDate) {
                const groupKey = getGroupKey(orderDate);
                if (revenueMap.has(groupKey)) {
                  const currentRevenue = revenueMap.get(groupKey);
                  revenueMap.set(groupKey, currentRevenue + order.total);
                }
              }
            }
          });
        }
      });

      const chartData = {
        labels: [],
        datasets: [{ data: [] }],
      };

      // Giới hạn số điểm dữ liệu cho dễ đọc
      let targetDates = dateArray;
      let maxDataPoints = 12; // Số điểm dữ liệu tối đa hiển thị

      if (dateArray.length > maxDataPoints) {
        const step = Math.ceil(dateArray.length / maxDataPoints);
        targetDates = dateArray.filter((_, i) => i % step === 0);
      }

      targetDates.forEach((dateKey) => {
        chartData.labels.push(getDisplayLabel(dateKey));
        chartData.datasets[0].data.push(revenueMap.get(dateKey) || 0);
      });

      callback(chartData);
      resolve(chartData);
    });
  });
};

// === 3. Top sản phẩm bán chạy (với thêm hình ảnh) ===
export const getTopProducts = async (limit = 5, callback) => {
  const db = getDatabase();
  const usersRef = ref(db, "users");
  const productsRef = ref(db, "products");

  const productSalesMap = new Map();

  return new Promise((resolve) => {
    onValue(usersRef, (usersSnapshot) => {
      const usersData = usersSnapshot.val();

      onValue(productsRef, (productsSnapshot) => {
        const productsData = productsSnapshot.val();

        Object.values(usersData || {}).forEach((user) => {
          if (user.orders) {
            Object.values(user.orders).forEach((order) => {
              if (order.status === "delivered" && order.items) {
                order.items.forEach((item) => {
                  // fallback id lấy từ item.id nếu productId không tồn tại
                  const productId = item.productId || item.id;
                  const quantity = item.quantity;
                  const price = item.price;

                  if (!productSalesMap.has(productId)) {
                    const productData =
                      productsData && productsData[productId]
                        ? productsData[productId]
                        : null;

                    productSalesMap.set(productId, {
                      id: productId,
                      name: productData
                        ? productData.name
                        : item.name || `Sản phẩm #${productId}`,
                      image: productData
                        ? productData.image ||
                          productData.imageUrl ||
                          productData.images?.[0]
                        : null,
                      quantity: 0,
                      revenue: 0,
                    });
                  }

                  const product = productSalesMap.get(productId);
                  product.quantity += quantity;
                  product.revenue += price * quantity;
                });
              }
            });
          }
        });

        const topProducts = Array.from(productSalesMap.values())
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, limit);

        callback(topProducts);
        resolve(topProducts);
      });
    });
  });
};

// === 4. Doanh thu theo danh mục ===
export const getRevenueByCategory = async (callback) => {
  const db = getDatabase();
  const usersRef = ref(db, "users");
  const productsRef = ref(db, "products");
  const categoriesRef = ref(db, "categories");

  const categoryRevenueMap = new Map();

  return new Promise((resolve) => {
    onValue(categoriesRef, (categoriesSnapshot) => {
      const categoriesData = categoriesSnapshot.val();

      onValue(productsRef, (productsSnapshot) => {
        const productsData = productsSnapshot.val();

        onValue(usersRef, (usersSnapshot) => {
          const usersData = usersSnapshot.val();

          const productCategoryMap = new Map();

          if (productsData) {
            Object.entries(productsData).forEach(([productId, product]) => {
              if (product.category) {
                productCategoryMap.set(productId, product.category);
              }
            });
          }

          if (categoriesData) {
            Object.entries(categoriesData).forEach(([catId, category]) => {
              categoryRevenueMap.set(catId, {
                id: catId,
                name: category.title || `Danh mục #${catId}`,
                revenue: 0,
              });
            });
          }

          Object.values(usersData || {}).forEach((user) => {
            if (user.orders) {
              Object.values(user.orders).forEach((order) => {
                if (order.status === "delivered" && order.items) {
                  order.items.forEach((item) => {
                    const productId = item.productId || item.id;
                    const categoryId = productCategoryMap.get(productId);

                    if (categoryId && categoryRevenueMap.has(categoryId)) {
                      const cat = categoryRevenueMap.get(categoryId);
                      cat.revenue += item.price * item.quantity;
                    }
                  });
                }
              });
            }
          });

          const categoryData = Array.from(categoryRevenueMap.values())
            .filter((cat) => cat.revenue > 0)
            .sort((a, b) => b.revenue - a.revenue);

          callback(categoryData);
          resolve(categoryData);
        });
      });
    });
  });
};
