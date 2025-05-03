import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl
} from "react-native";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const OrderStatusScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth();

  const fetchOrders = async () => {
    try {
      const userId = auth.currentUser.uid;
      const database = getDatabase();
      const ordersRef = ref(database, `users/${userId}/orders`);

      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Convert object to array and sort by createdAt (newest first)
          const ordersList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          
          // Sort orders by createdAt (newest first)
          ordersList.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          setOrders(ordersList);
        } else {
          setOrders([]);
        }
        setLoading(false);
        setRefreshing(false);
      });
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f39c12"; // Vàng
      case "processing":
        return "#3498db"; // Xanh dương
      case "shipped":
        return "#2ecc71"; // Xanh lá
      case "delivered":
        return "#27ae60"; // Xanh lá đậm
      case "cancelled":
        return "#e74c3c"; // Đỏ
      default:
        return "#95a5a6"; // Xám
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "processing":
        return "construct-outline";
      case "shipped":
        return "car-outline";
      case "delivered":
        return "checkmark-circle-outline";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  // Format date to more readable form
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Hôm nay, ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Hôm qua, ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const renderOrderItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const statusText = getStatusText(item.status);
    const statusIcon = getStatusIcon(item.status);
    
    // Calculate total items
    const totalItems = item.items ? item.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderDateContainer}>
            <AntDesign name="calendar" size={14} color="#7f8c8d" style={styles.headerIcon} />
            <Text style={styles.orderDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <View style={styles.orderIdContainer}>
            <MaterialIcons name="receipt" size={14} color="#2c3e50" style={styles.headerIcon} />
            <Text style={styles.orderNumber}>#{item.id.slice(-6)}</Text>
          </View>
        </View>
        
        <View style={styles.statusBadge} backgroundColor={statusColor}>
          <Ionicons name={statusIcon} size={14} color="white" />
          <Text style={styles.statusBadgeText}>{statusText}</Text>
        </View>
        
        <View style={styles.productImagesContainer}>
          {item.items && item.items.slice(0, 4).map((product, index) => (
            <View key={index} style={styles.productImageWrapper}>
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
              {product.quantity > 1 && (
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>x{product.quantity}</Text>
                </View>
              )}
            </View>
          ))}
          {item.items && item.items.length > 4 && (
            <View style={styles.moreItemsBadge}>
              <Text style={styles.moreItemsText}>+{item.items.length - 4}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng sản phẩm:</Text>
            <Text style={styles.summaryValue}>{totalItems} món</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng tiền:</Text>
            <Text style={styles.totalValue}>{item.total?.toLocaleString('vi-VN')} ₫</Text>
          </View>
        </View>
        
        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.trackButton]}
            onPress={() => navigation.navigate("OrderTracking", { orderId: item.id })}
          >
            <Ionicons name="navigate-outline" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Theo dõi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.detailButton]}
            onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
          >
            <Ionicons name="eye-outline" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tình trạng đơn hàng</Text>
      </View>
      
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3498db"]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#bdc3c7" />
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  listContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 12,
  },
  orderDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  orderNumber: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "bold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 14,
  },
  statusBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  productImagesContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  productImageWrapper: {
    position: "relative",
    marginRight: 8,
    marginBottom: 6,
  },
  productImage: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: "#f1f2f6",
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  quantityBadge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "#ff6b6b",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  quantityText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  moreItemsBadge: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  moreItemsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  orderSummary: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16, 
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  summaryValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "bold",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  trackButton: {
    backgroundColor: "#3498db",
  },
  detailButton: {
    backgroundColor: "#2ecc71",
  },
  actionButtonText: {
    marginLeft: 6,
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 16,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  shopButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default OrderStatusScreen;