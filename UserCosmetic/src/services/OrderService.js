import { getDatabase, ref, set } from "firebase/database";

// Hàm để lưu đơn hàng vào Firebase
export const placeOrder = (orderDetails, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase(); 
      const orderId = orderDetails.orderId; 

      if (!orderId) {
        throw new Error("Order ID is missing");
      }

      const orderRef = ref(db, `orders/${orderId}`);

      // Cấu trúc dữ liệu đơn hàng
      const orderData = {
        userId,
        products: orderDetails.products,
        totalAmount: orderDetails.totalAmount,
        shippingMethod: orderDetails.shippingMethod || 'Standard',
        shippingTime: orderDetails.shippingTime || 'Normal',
        discountCode: orderDetails.discountCode || '',
        note: orderDetails.note || '',
        orderStatus: "Đang xử lý",
        createdAt: new Date().toISOString(), 
        shippingAddress: orderDetails.shippingAddress,
        phoneNumber: orderDetails.phoneNumber,
      };

      // Lưu đơn hàng vào Firebase Realtime Database
      set(orderRef, orderData)
        .then(() => {
          console.log("Đặt hàng thành công!");
          resolve(orderData);
        })
        .catch((error) => {
          console.error("Có lỗi khi đặt hàng:", error);
          reject(error);
        });
    } catch (error) {
      console.error("Lỗi khi xử lý đơn hàng:", error);
      reject(error);
    }
  });
};
