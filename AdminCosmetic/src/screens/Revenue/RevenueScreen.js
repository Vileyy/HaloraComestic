// revenue/RevenueScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  getRevenueStats,
  getRevenueByPeriod,
  getTopProducts,
  getRevenueByCategory,
} from "./revenueUtils";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("window").width;

// Bảng màu cho ứng dụng
const COLORS = {
  primary: "#3366FF",
  secondary: "#FF6B6B",
  accent: "#33CC99",
  background: "#F0F4F8",
  card: "#FFFFFF",
  text: {
    dark: "#344955",
    medium: "#4A6572",
    light: "#6B7C85",
  },
  border: "#E5E9EC",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#FF5252",
  chartColors: [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8AC926",
    "#1982C4",
    "#6A4C93",
    "#F15BB5",
  ],
};

const RevenueScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState("start");

  const [stats, setStats] = useState({
    revenueToday: 0,
    revenueMonth: 0,
    revenueYear: 0,
    totalProductsSold: 0,
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await getRevenueStats(setStats);
      await getRevenueByPeriod(
        dateRange.startDate,
        dateRange.endDate,
        setChartData
      );
      await getTopProducts(5, setTopProducts);
      await getRevenueByCategory(setCategoryData);
      setIsLoading(false);
    };

    loadData();
  }, [dateRange]);

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };
  const truncateWords = (str, numWords) => {
    if (!str) return "";
    const words = str.trim().split(" ");
    if (words.length <= numWords) return str;
    return words.slice(0, numWords).join(" ") + "...";
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (datePickerType === "start") {
        setDateRange((prev) => ({ ...prev, startDate: selectedDate }));
      } else {
        setDateRange((prev) => ({ ...prev, endDate: selectedDate }));
      }
    }
  };

  const showDatePickerModal = (type) => {
    setDatePickerType(type);
    setShowDatePicker(true);
  };

  // Các biểu tượng cho thẻ thống kê
  const statsIcons = {
    today: "today-outline",
    month: "calendar-outline",
    year: "calendar-clear-outline",
    products: "cube-outline",
  };

  // Gradient Colors cho các thẻ thống kê
  const statsCardGradients = [
    ["#3366FF", "#5E8AFF"], // Blue gradient
    ["#FF6B6B", "#FF9E9E"], // Red gradient
    ["#33CC99", "#7AE0C7"], // Green gradient
    ["#FFCE56", "#FFE1A0"], // Yellow gradient
  ];

  const renderOverviewTab = () => (
    <>
      <View style={styles.statsContainer}>
        <LinearGradient colors={statsCardGradients[0]} style={styles.statsCard}>
          <Text style={styles.statsLabelLight}>Hôm nay</Text>
          <Text style={styles.statsValueLight}>
            {formatCurrency(stats.revenueToday)}
          </Text>
          <Ionicons name={statsIcons.today} size={24} color="#FFFFFF" />
        </LinearGradient>

        <LinearGradient colors={statsCardGradients[1]} style={styles.statsCard}>
          <Text style={styles.statsLabelLight}>Tháng này</Text>
          <Text style={styles.statsValueLight}>
            {formatCurrency(stats.revenueMonth)}
          </Text>
          <Ionicons name={statsIcons.month} size={24} color="#FFFFFF" />
        </LinearGradient>

        <LinearGradient colors={statsCardGradients[2]} style={styles.statsCard}>
          <Text style={styles.statsLabelLight}>Cả năm</Text>
          <Text style={styles.statsValueLight}>
            {formatCurrency(stats.revenueYear)}
          </Text>
          <Ionicons name={statsIcons.year} size={24} color="#FFFFFF" />
        </LinearGradient>

        <LinearGradient colors={statsCardGradients[3]} style={styles.statsCard}>
          <Text style={styles.statsLabelLight}>Sản phẩm đã bán</Text>
          <Text style={styles.statsValueLight}>{stats.totalProductsSold}</Text>
          <Ionicons name={statsIcons.products} size={24} color="#FFFFFF" />
        </LinearGradient>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Doanh thu theo thời gian</Text>
        <View style={styles.datePickerContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => showDatePickerModal("start")}
          >
            <Text style={styles.dateButtonText}>
              Từ: {dateRange.startDate.toLocaleDateString("vi-VN")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => showDatePickerModal("end")}
          >
            <Text style={styles.dateButtonText}>
              Đến: {dateRange.endDate.toLocaleDateString("vi-VN")}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={
              datePickerType === "start"
                ? dateRange.startDate
                : dateRange.endDate
            }
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: COLORS.card,
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#F0F4F8",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(51, 102, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(74, 101, 114, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: COLORS.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </>
  );

  const renderProductsTab = () => (
    <>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Top 5 sản phẩm bán chạy</Text>
        <BarChart
          data={{
            labels: topProducts.map((product) =>
              product.name.length > 8
                ? product.name.substring(0, 8) + "..."
                : product.name
            ),
            datasets: [
              {
                data: topProducts.map((product) => product.quantity),
                colors: [
                  (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Đỏ
                  (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Xanh dương
                  (opacity = 1) => `rgba(255, 159, 64, ${opacity})`, // Cam
                  (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, // Xanh lá
                  (opacity = 1) => `rgba(153, 102, 255, ${opacity})`, // Tím
                ],
              },
            ],
          }}
          width={screenWidth - 40}
          height={280}
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.6,
            fillShadowGradient: "#FFFFFF",
            fillShadowGradientOpacity: 0.1,
            propsForBackgroundLines: {
              strokeWidth: 1,
              stroke: "#E5E9EC",
              strokeDasharray: "0",
            },
            propsForLabels: {
              fontSize: 11,
              fontWeight: "600",
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#FFFFFF",
            },
          }}
          style={styles.chart}
          showBarTops={true}
          withInnerLines={true}
          withOuterLines={true}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          withDots={false}
          withShadow={true}
          withCustomBarColorFromData={true}
          flatColor={false}
          segments={4}
          fromZero={true}
        />
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.chartTitle}>Chi tiết sản phẩm bán chạy</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Ảnh</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Sản phẩm</Text>
          <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>SL</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Doanh thu</Text>
        </View>

        {topProducts.map((product, index) => (
          <View
            key={index}
            style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : null]}
          >
            <View style={[styles.tableCell, { flex: 0.8 }]}>
              <Image
                source={{
                  uri:
                    product.image ||
                    `https://via.placeholder.com/40?text=${product.name.charAt(
                      0
                    )}`,
                }}
                style={styles.productImage}
              />
            </View>
            <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
              {truncateWords(product.name, 3)}
            </Text>

            <Text style={[styles.tableCell, { flex: 0.8 }]}>
              {product.quantity}
            </Text>
            <Text
              style={[styles.tableCell, { flex: 1.5, color: COLORS.text.dark }]}
            >
              {formatCurrency(product.revenue)}
            </Text>
          </View>
        ))}
      </View>
    </>
  );

  const renderCategoriesTab = () => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Doanh thu theo danh mục</Text>
      <PieChart
        data={categoryData.map((item, index) => ({
          name: item.name,
          population: item.revenue,
          color: COLORS.chartColors[index % COLORS.chartColors.length],
          legendFontColor: COLORS.text.medium,
          legendFontSize: 12,
        }))}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
        absolute
      />

      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Danh mục</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Doanh thu</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>%</Text>
        </View>

        {categoryData.map((category, index) => {
          const totalRevenue = categoryData.reduce(
            (sum, cat) => sum + cat.revenue,
            0
          );
          const percentage =
            totalRevenue > 0
              ? ((category.revenue / totalRevenue) * 100).toFixed(1)
              : "0";

          return (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : null]}
            >
              <View
                style={[
                  styles.tableCell,
                  { flex: 2, flexDirection: "row", alignItems: "center" },
                ]}
              >
                <View
                  style={[
                    styles.categoryDot,
                    {
                      backgroundColor:
                        COLORS.chartColors[index % COLORS.chartColors.length],
                    },
                  ]}
                />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Text
                style={[
                  styles.tableCell,
                  { flex: 1.5, color: COLORS.text.dark },
                ]}
              >
                {formatCurrency(category.revenue)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, fontWeight: "bold" }]}>
                {percentage}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["white", "white"]} style={styles.headerGradient}>
        <Text style={styles.title}>📊 Báo cáo doanh thu</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            Tổng quan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "products" && styles.activeTab]}
          onPress={() => setActiveTab("products")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "products" && styles.activeTabText,
            ]}
          >
            Sản phẩm
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "categories" && styles.activeTab]}
          onPress={() => setActiveTab("categories")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "categories" && styles.activeTabText,
            ]}
          >
            Danh mục
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "overview" && renderOverviewTab()}
      {activeTab === "products" && renderProductsTab()}
      {activeTab === "categories" && renderCategoriesTab()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text.medium,
  },
  headerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    marginTop: 30,
    padding: 5,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -15,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.text.light,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 16,
  },
  statsCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    alignItems: "flex-start",
  },
  statsLabelLight: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  statsValueLight: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text.dark,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
  },
  dateButtonText: {
    color: COLORS.text.medium,
  },
  tableCard: {
    marginTop: 8,
    padding: 13,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text.dark,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  evenRow: {
    backgroundColor: "rgba(240, 244, 248, 0.5)",
  },
  tableCell: {
    fontSize: 14,
    color: COLORS.text.medium,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E9EC",
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: COLORS.text.medium,
  },
});

export default RevenueScreen;
