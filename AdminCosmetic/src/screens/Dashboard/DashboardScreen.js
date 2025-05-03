import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // 📌 Thêm gradient
import { MaterialIcons } from "@expo/vector-icons";

export default function DashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎛 Dashboard Admin</Text>

      <View style={styles.grid}>
        {/* Quản lý sản phẩm */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("ProductListScreen")}
        >
          <LinearGradient
            colors={["#3498db", "#2980b9"]}
            style={styles.cardInner}
          >
            <MaterialIcons name="shopping-cart" size={50} color="#fff" />
            <Text style={styles.cardText}>Quản lý sản phẩm</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quản lý danh mục */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("CategoryListScreen")}
        >
          <LinearGradient
            colors={["#e67e22", "#d35400"]}
            style={styles.cardInner}
          >
            <MaterialIcons name="category" size={50} color="#fff" />
            <Text style={styles.cardText}>Quản lý danh mục</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quản lý thương hiệu */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("BrandListScreen")}
        >
          <LinearGradient
            colors={["#2ecc71", "#27ae60"]}
            style={styles.cardInner}
          >
            <MaterialIcons name="store" size={50} color="#fff" />
            <Text style={styles.cardText}>Quản lý thương hiệu</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quản lý đơn hàng */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("OrderListScreen")}
        >
          <LinearGradient
            colors={["#8e44ad", "#6c3483"]}
            style={styles.cardInner}
          >
            <MaterialIcons name="add-shopping-cart" size={50} color="#fff" />
            <Text style={styles.cardText}>Quản lý đơn hàng</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quản lý người dùng */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("UserListScreen")}
        >
          <LinearGradient
            colors={["#f1c40f", "#f39c12"]}
            style={styles.cardInner}
          >
            <MaterialIcons name="people" size={50} color="#fff" />
            <Text style={styles.cardText}>Quản lý người dùng</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quản lý doanh thu */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("RevenueScreen")}
        >
          <LinearGradient
            colors={["#e74c3c", "#c0392b"]}
            style={styles.cardInner}
          >
            <MaterialIcons name="bar-chart" size={50} color="#fff" />
            <Text style={styles.cardText}>Quản lý doanh thu</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quản lý banner */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("BannerListScreen")}
        >
          <LinearGradient
            colors={["#1abc9c", "#16a085"]}
            style={styles.cardInner}
          >
            <MaterialIcons name="image" size={50} color="#fff" />
            <Text style={styles.cardText}>Quản lý banner</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quản lý thông báo */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("NotificationListScreen")}
        >
          <LinearGradient
            colors={["#9b59b6", "#8e44ad"]}
            style={styles.cardInner}
          >
            <MaterialIcons name="notifications" size={50} color="#fff" />
            <Text style={styles.cardText}>Quản lý thông báo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: 160,
    height: 140,
    margin: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  cardInner: {
    flex: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
