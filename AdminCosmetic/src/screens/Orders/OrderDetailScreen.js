import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getDatabase, ref, update } from "firebase/database";

// Đồng bộ với trạng thái phía người dùng
const statusOptions = [
  {
    label: "Chờ xác nhận",
    value: "pending",
    color: "#f5a623",
    bgColor: "#FFF5E6",
    icon: "time-outline",
  },
  {
    label: "Đang xử lý",
    value: "processing",
    color: "#9C27B0",
    bgColor: "#F3E5F5",
    icon: "sync-outline",
  },
  {
    label: "Đang giao hàng",
    value: "shipped",
    color: "#4a90e2",
    bgColor: "#E3F2FD",
    icon: "car-outline",
  },
  {
    label: "Đã giao hàng",
    value: "delivered",
    color: "#4CAF50",
    bgColor: "#E8F5E9",
    icon: "checkmark-circle-outline",
  },
  {
    label: "Đã hủy",
    value: "cancelled",
    color: "#F44336",
    bgColor: "#FFEBEE",
    icon: "close-circle-outline",
  },
];

const OrderDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { order } = route.params;

  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    if (selectedStatus === order.status) {
      Alert.alert("Thông báo", "Trạng thái không thay đổi");
      return;
    }

    setIsUpdating(true);
    const db = getDatabase();
    const orderRef = ref(db, `users/${order.userId}/orders/${order.orderId}`);

    try {
      await update(orderRef, { status: selectedStatus });
      Alert.alert("✅ Thành công", "Cập nhật trạng thái đơn hàng thành công!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("❌ Lỗi", "Cập nhật trạng thái thất bại!");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Tìm thông tin trạng thái hiện tại
  const getCurrentStatus = () => {
    return (
      statusOptions.find((s) => s.value === order.status) || statusOptions[0]
    );
  };

  const currentStatus = getCurrentStatus();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Chi tiết đơn hàng</Text>
          <Text style={styles.orderNumber}>#{order.orderId.slice(-6)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: currentStatus.bgColor },
          ]}
        >
          <Ionicons
            name={currentStatus.icon}
            size={16}
            color={currentStatus.color}
          />
          <Text style={[styles.statusText, { color: currentStatus.color }]}>
            {currentStatus.label}
          </Text>
        </View>
      </View>

      {/* Thông tin thời gian */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#666"
            style={styles.icon}
          />
          <Text style={styles.infoLabel}>Ngày đặt:</Text>
          <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
        </View>
      </View>

      {/* Thông tin khách hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={18}
              color="#666"
              style={styles.icon}
            />
            <Text style={styles.infoLabel}>Họ tên:</Text>
            <Text style={styles.infoValue}>{order.customerName || "Không có thông tin"}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name="mail-outline"
              size={18}
              color="#666"
              style={styles.icon}
            />
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{order.email || "Không có thông tin"}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name="call-outline"
              size={18}
              color="#666"
              style={styles.icon}
            />
            <Text style={styles.infoLabel}>Điện thoại:</Text>
            <Text style={styles.infoValue}>{order.phone || "Không có thông tin"}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={18}
              color="#666"
              style={styles.icon}
            />
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={styles.infoValue}>{order.address || "Không có thông tin"}</Text>
          </View>
        </View>
      </View>

      {/* Danh sách sản phẩm */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
        <View style={styles.productsCard}>
          <FlatList
            data={order.items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>
                      {item.price.toLocaleString()}đ
                    </Text>
                    <Text style={styles.productQuantity}>x{item.quantity}</Text>
                  </View>
                </View>
              </View>
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          />

          {/* Tổng tiền */}
          <View style={styles.totalContainer}>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng tiền:</Text>
              <Text style={styles.totalValue}>
                {order.total.toLocaleString()}đ
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Cập nhật trạng thái */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cập nhật trạng thái</Text>
        <View style={styles.statusCard}>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status.value}
              style={[
                styles.statusOption,
                selectedStatus === status.value && styles.statusOptionSelected,
                selectedStatus === status.value && {
                  backgroundColor: status.bgColor,
                },
              ]}
              onPress={() => setSelectedStatus(status.value)}
            >
              <Ionicons
                name={
                  selectedStatus === status.value
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={
                  selectedStatus === status.value ? status.color : "#757575"
                }
                style={styles.radioIcon}
              />
              <View style={styles.statusLabelContainer}>
                <Ionicons
                  name={status.icon}
                  size={16}
                  color={
                    selectedStatus === status.value ? status.color : "#757575"
                  }
                  style={styles.statusIcon}
                />
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === status.value && {
                      color: status.color,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {status.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Nút lưu */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          selectedStatus === order.status && styles.saveButtonDisabled,
        ]}
        onPress={handleStatusChange}
        disabled={selectedStatus === order.status || isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Cập nhật trạng thái</Text>
        )}
      </TouchableOpacity>

      {/* Extra padding để không bị che khi scroll */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  orderNumber: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    margin: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  icon: {
    marginRight: 6,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 8,
  },
  productsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    lineHeight: 20,
  },
  productPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e53935",
  },
  productQuantity: {
    fontSize: 14,
    color: "#757575",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: "#f5f5f5",
  },
  totalContainer: {
    marginTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e53935",
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 2,
  },
  statusOptionSelected: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  radioIcon: {
    marginRight: 10,
  },
  statusLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: 6,
  },
  statusOptionText: {
    fontSize: 14,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#4a90e2",
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#4a90e2",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: "#b0bec5",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});