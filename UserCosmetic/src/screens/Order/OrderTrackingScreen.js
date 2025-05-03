import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const OrderTrackingScreen = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const userId = auth.currentUser.uid;
        const database = getDatabase();
        const orderRef = ref(database, `orders/${userId}/${orderId}`);

        onValue(orderRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setOrder({ id: orderId, ...data });
          } else {
            Alert.alert("Lỗi", "Không tìm thấy thông tin đơn hàng.");
            navigation.goBack();
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        Alert.alert(
          "Lỗi",
          "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
        );
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          title: "Chờ xác nhận",
          description: "Đơn hàng của bạn đang chờ xác nhận từ cửa hàng",
          color: "#f39c12",
          icon: "time-outline",
          mapIcon: "ellipse-outline",
        };
      case "processing":
        return {
          title: "Đang xử lý",
          description: "Đơn hàng của bạn đang được chuẩn bị",
          color: "#3498db",
          icon: "construct-outline",
          mapIcon: "home-outline",
        };
      case "shipped":
        return {
          title: "Đang giao hàng",
          description: "Đơn hàng của bạn đang trên đường giao đến",
          color: "#2ecc71",
          icon: "car-outline",
          mapIcon: "car-outline",
        };
      case "delivered":
        return {
          title: "Đã giao hàng",
          description: "Đơn hàng của bạn đã được giao thành công",
          color: "#27ae60",
          icon: "checkmark-circle-outline",
          mapIcon: "flag-outline",
        };
      case "cancelled":
        return {
          title: "Đã hủy",
          description: "Đơn hàng của bạn đã bị hủy",
          color: "#e74c3c",
          icon: "close-circle-outline",
          mapIcon: "close-circle-outline",
        };
      default:
        return {
          title: "Không xác định",
          description: "Không có thông tin về trạng thái đơn hàng",
          color: "#95a5a6",
          icon: "help-circle-outline",
          mapIcon: "help-circle-outline",
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Order Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.orderNumber}>Đơn hàng #{order.id.slice(-6)}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
        >
          <Text style={styles.statusText}>{statusInfo.title}</Text>
        </View>
      </View>

      {/* Map Tracking View */}
      <View style={styles.mapContainer}>
        <View style={styles.map}>
          {/* Placeholder for actual map implementation */}
          <Image
            source={require("../../assets/order-success.jpg")}
            style={styles.mapImage}
            resizeMode="cover"
          />

          {/* Status Icons on Map */}
          <View style={styles.mapIcons}>
            <View
              style={[
                styles.mapIconContainer,
                {
                  backgroundColor:
                    order.status !== "cancelled" ? "#27ae60" : "#e74c3c",
                },
              ]}
            >
              <Ionicons name="home-outline" size={20} color="white" />
            </View>

            <View style={styles.mapLine} />

            <View
              style={[
                styles.mapIconContainer,
                {
                  backgroundColor:
                    order.status === "shipped" || order.status === "delivered"
                      ? "#27ae60"
                      : "#bdc3c7",
                },
              ]}
            >
              <Ionicons name="car-outline" size={20} color="white" />
            </View>

            <View style={styles.mapLine} />

            <View
              style={[
                styles.mapIconContainer,
                {
                  backgroundColor:
                    order.status === "delivered" ? "#27ae60" : "#bdc3c7",
                },
              ]}
            >
              <Ionicons name="flag-outline" size={20} color="white" />
            </View>
          </View>
        </View>

        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryDetail}>
            <Ionicons name="calendar-outline" size={20} color="#3498db" />
            <View style={styles.deliveryTextContainer}>
              <Text style={styles.deliveryLabel}>Ngày giao dự kiến</Text>
              <Text style={styles.deliveryValue}>
                {order.estimatedDelivery || "Đang cập nhật"}
              </Text>
            </View>
          </View>

          <View style={styles.deliveryDivider} />

          <View style={styles.deliveryDetail}>
            <Ionicons name="person-outline" size={20} color="#3498db" />
            <View style={styles.deliveryTextContainer}>
              <Text style={styles.deliveryLabel}>Người giao hàng</Text>
              <Text style={styles.deliveryValue}>
                {order.shippingInfo?.courierName || "Đang cập nhật"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tracking Timeline */}
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>Thông tin theo dõi</Text>

        <View style={styles.timeline}>
          {/* Always show order placed */}
          <TrackingEvent
            title="Đơn hàng đã đặt"
            description="Đơn hàng của bạn đã được đặt thành công"
            time={new Date(order.orderDate).toLocaleString("vi-VN")}
            icon="cart-outline"
            isActive={true}
          />

          {/* Conditional rendering based on order status */}
          {order.status !== "pending" && order.status !== "cancelled" && (
            <TrackingEvent
              title="Đơn hàng đã được xác nhận"
              description="Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị"
              time={
                order.confirmedDate
                  ? new Date(order.confirmedDate).toLocaleString("vi-VN")
                  : "Đang cập nhật"
              }
              icon="checkmark-circle-outline"
              isActive={true}
            />
          )}

          {(order.status === "shipped" || order.status === "delivered") && (
            <TrackingEvent
              title="Đơn hàng đang được giao"
              description={`Đơn hàng ${
                order.trackingId ? `#${order.trackingId}` : ""
              } đã được bàn giao cho đơn vị vận chuyển`}
              time={
                order.shippedDate
                  ? new Date(order.shippedDate).toLocaleString("vi-VN")
                  : "Đang cập nhật"
              }
              icon="car-outline"
              isActive={true}
            />
          )}

          {order.status === "shipped" &&
            order.trackingEvents?.map((event, index) => (
              <TrackingEvent
                key={index}
                title={event.title}
                description={event.description}
                time={event.time}
                icon="navigate-outline"
                isActive={true}
              />
            ))}

          {order.status === "delivered" && (
            <TrackingEvent
              title="Đơn hàng đã được giao"
              description="Đơn hàng của bạn đã được giao thành công"
              time={
                order.deliveredDate
                  ? new Date(order.deliveredDate).toLocaleString("vi-VN")
                  : "Đang cập nhật"
              }
              icon="flag-outline"
              isActive={true}
            />
          )}

          {order.status === "cancelled" && (
            <TrackingEvent
              title="Đơn hàng đã bị hủy"
              description={order.cancelReason || "Đơn hàng đã bị hủy"}
              time={
                order.cancelledDate
                  ? new Date(order.cancelledDate).toLocaleString("vi-VN")
                  : "Đang cập nhật"
              }
              icon="close-circle-outline"
              isActive={true}
              isError={true}
            />
          )}

          {/* Future events */}
          {/* Future events */}
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <TrackingEvent
              title="Đơn hàng sẽ được giao"
              description="Chúng tôi sẽ thông báo khi đơn hàng được giao"
              time={"Dự kiến: " + (order.estimatedDelivery || "Đang cập nhật")}
              icon="flag-outline"
              isActive={false}
            />
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {order.status === "shipped" && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              Alert.alert(
                "Xác nhận đã nhận hàng",
                "Bạn đã nhận được đơn hàng này?",
                [
                  {
                    text: "Hủy",
                    style: "cancel",
                  },
                  {
                    text: "Xác nhận",
                    onPress: () =>
                      Alert.alert(
                        "Thông báo",
                        "Tính năng này đang được phát triển"
                      ),
                  },
                ]
              );
            }}
          >
            <Text style={styles.primaryButtonText}>Xác nhận đã nhận hàng</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate("CustomerSupport", { orderId: order.id })
          }
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color="#3498db"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.secondaryButtonText}>Liên hệ hỗ trợ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// TrackingEvent Component
const TrackingEvent = ({
  title,
  description,
  time,
  icon,
  isActive,
  isError = false,
}) => {
  const activeColor = isError ? "#e74c3c" : "#3498db";
  const inactiveColor = "#bdc3c7";

  return (
    <View style={styles.trackingEvent}>
      <View style={styles.trackingIconColumn}>
        <View
          style={[
            styles.trackingIconContainer,
            { backgroundColor: isActive ? activeColor : inactiveColor },
          ]}
        >
          <Ionicons name={icon} size={16} color="white" />
        </View>
        <View
          style={[
            styles.trackingLine,
            { backgroundColor: isActive ? activeColor : inactiveColor },
          ]}
        />
      </View>

      <View style={styles.trackingContent}>
        <Text
          style={[
            styles.trackingTitle,
            { color: isActive ? (isError ? "#e74c3c" : "#2c3e50") : "#95a5a6" },
          ]}
        >
          {title}
        </Text>

        <Text style={styles.trackingDescription}>{description}</Text>

        <Text style={styles.trackingTime}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  // Status Bar
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 1,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Map Container
  mapContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    height: 200,
    width: "100%",
    backgroundColor: "#e0e0e0",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapIcons: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    top: "50%",
    left: "10%",
  },
  mapIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  mapLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#bdc3c7",
  },
  deliveryInfo: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  deliveryDetail: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryTextContainer: {
    marginLeft: 12,
  },
  deliveryLabel: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  deliveryValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  deliveryDivider: {
    width: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },

  // Timeline Container
  timelineContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  timeline: {
    marginLeft: 8,
  },
  trackingEvent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  trackingIconColumn: {
    alignItems: "center",
    width: 24,
  },
  trackingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3498db",
    marginRight: 12,
  },
  trackingLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#3498db",
    marginVertical: 4,
  },
  trackingContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  trackingTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  trackingDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  trackingTime: {
    fontSize: 12,
    color: "#95a5a6",
  },

  // Action Container
  actionContainer: {
    padding: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3498db",
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#3498db",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default OrderTrackingScreen;
