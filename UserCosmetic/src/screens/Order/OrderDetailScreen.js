import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  get,
  remove,
  update,
} from "firebase/database";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const OrderDetailScreen = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [processingCancel, setProcessingCancel] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const navigation = useNavigation();
  const auth = getAuth();

  // Animation for modal
  useEffect(() => {
    if (cancelModalVisible) {
      Animated.spring(animatedValue, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [cancelModalVisible]);

  const modalTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const modalOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        if (!auth.currentUser) {
          console.log("No authenticated user found");
          setError("Vui lòng đăng nhập để xem chi tiết đơn hàng");
          setLoading(false);
          return;
        }

        const userId = auth.currentUser.uid;
        const database = getDatabase();
        const paths = [
          `users/${userId}/orders/${orderId}`,
          `orders/${userId}/${orderId}`,
          `orders/${orderId}`,
        ];

        let foundData = false;

        for (const path of paths) {
          console.log(`Trying path: ${path}`);
          const orderRef = ref(database, path);
          const snapshot = await get(orderRef);
          const data = snapshot.val();

          if (data) {
            console.log(`Found data at path: ${path}`);
            console.log("Order data:", data);
            const updates = {};
            const now = new Date().toISOString();
            if (data.status === "processing" && !data.confirmedDate) {
              updates.confirmedDate = now;
              data.confirmedDate = now;
            }

            if (
              (data.status === "shipped" || data.status === "delivered") &&
              !data.shippedDate
            ) {
              updates.shippedDate = now;
              data.shippedDate = now;
            }

            if (data.status === "delivered" && !data.deliveredDate) {
              updates.deliveredDate = now;
              data.deliveredDate = now;
            }

            if (Object.keys(updates).length > 0) {
              await update(orderRef, updates);
            }

            setOrder({ id: orderId, path, ...data });
            foundData = true;
            break;
          }
        }

        if (!foundData) {
          console.log("No data found in any of the paths");
          setError("Không tìm thấy thông tin đơn hàng");
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const getStatusColor = (status) => {
    if (!status) return "#95a5a6"; //gray color

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
    if (!status) return "Không xác định";

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
    if (!status) return "help-circle-outline";

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

  // Tính tổng tiền từ items
  const calculateTotal = () => {
    if (!order) return 0;

    if (order.total) return order.total;
    const items = order.products || order.items;
    if (!items || items.length === 0) return 0;

    const subtotal = items.reduce((sum, item) => {
      return sum + (Number(item.price) || 0) * (item.quantity || 1);
    }, 0);

    const shippingFee = Number(order.shippingFee) || 0;
    const discount = Number(order.discount) || 0;

    return subtotal + shippingFee - discount;
  };
  const handleCancelOrder = async () => {
    try {
      setProcessingCancel(true);

      if (!order || !order.path) {
        console.error("Order information missing");
        return;
      }

      const database = getDatabase();

      const orderRef = ref(database, order.path);
      await update(orderRef, {
        status: "cancelled",
        cancelledDate: new Date().toISOString(),
      });
      setOrder({
        ...order,
        status: "cancelled",
        cancelledDate: new Date().toISOString(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error cancelling order:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setProcessingCancel(false);
      setCancelModalVisible(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.errorTitle}>Không thể tải thông tin</Text>
          <Text style={styles.errorMessage}>
            {error || "Không tìm thấy thông tin đơn hàng"}
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Tính tổng số tiền
  const totalAmount = calculateTotal();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Order Status Section */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusIcon,
              { backgroundColor: getStatusColor(order.status) },
            ]}
          >
            <Ionicons
              name={getStatusIcon(order.status)}
              size={24}
              color="white"
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {getStatusText(order.status)}
            </Text>
            <Text style={styles.statusDescription}>
              {!order.status && "Trạng thái đơn hàng không xác định"}
              {order.status === "pending" &&
                "Đơn hàng của bạn đang chờ xác nhận"}
              {order.status === "processing" &&
                "Đơn hàng của bạn đang được xử lý"}
              {order.status === "shipped" && "Đơn hàng của bạn đang được giao"}
              {order.status === "delivered" &&
                "Đơn hàng của bạn đã được giao thành công"}
              {order.status === "cancelled" && "Đơn hàng của bạn đã bị hủy"}
            </Text>
          </View>
        </View>

        {/* Quick Info Bar */}
        <View style={styles.quickInfoBar}>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Mã đơn</Text>
            <Text style={styles.quickInfoValue}>
              #{order.id ? order.id.slice(-6) : orderId.slice(-6)}
            </Text>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Ngày đặt</Text>
            <Text style={styles.quickInfoValue}>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </Text>
          </View>

          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Tổng tiền</Text>
            <Text style={styles.quickInfoValueTotal}>
              {totalAmount.toLocaleString("vi-VN")}đ
            </Text>
          </View>
        </View>

        {/* Order Timeline */}
        {order.status && order.status !== "cancelled" && (
          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>Tiến trình đơn hàng</Text>

            <View style={styles.timeline}>
              <TimelineItem
                title="Đặt hàng"
                time={
                  order.orderDate
                    ? new Date(order.orderDate).toLocaleString("vi-VN")
                    : "Không xác định"
                }
                status="Hoàn thành"
                isActive={true}
                isFirst={true}
              />

              <TimelineItem
                title="Xác nhận"
                time={
                  order.confirmedDate
                    ? new Date(order.confirmedDate).toLocaleString("vi-VN")
                    : "Đang chờ"
                }
                status={order.status !== "pending" ? "Hoàn thành" : "Đang chờ"}
                isActive={order.status !== "pending"}
              />

              <TimelineItem
                title="Đang giao"
                time={
                  order.shippedDate
                    ? new Date(order.shippedDate).toLocaleString("vi-VN")
                    : "Đang chờ"
                }
                status={
                  order.status === "shipped" || order.status === "delivered"
                    ? "Hoàn thành"
                    : "Đang chờ"
                }
                isActive={
                  order.status === "shipped" || order.status === "delivered"
                }
              />

              <TimelineItem
                title="Đã giao"
                time={
                  order.deliveredDate
                    ? new Date(order.deliveredDate).toLocaleString("vi-VN")
                    : "Đang chờ"
                }
                status={
                  order.status === "delivered" ? "Hoàn thành" : "Đang chờ"
                }
                isActive={order.status === "delivered"}
                isLast={true}
              />
            </View>
          </View>
        )}

        {/* Order Information */}
        <View style={styles.infoSection}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#3498db"
            />
            <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mã đơn hàng</Text>
              <Text style={styles.infoValue}>
                #{order.id ? order.id.slice(-6) : orderId.slice(-6)}
              </Text>
            </View>

            {order.orderDate && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ngày đặt hàng</Text>
                <Text style={styles.infoValue}>
                  {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            )}

            {order.paymentMethod && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phương thức thanh toán</Text>
                <Text style={styles.infoValue}>
                  {order.paymentMethod === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : "Thanh toán online"}
                </Text>
              </View>
            )}

            {order.paymentStatus && (
              <View style={[styles.infoItem, styles.noBorder]}>
                <Text style={styles.infoLabel}>Trạng thái thanh toán</Text>
                <View style={styles.paymentStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          order.paymentStatus === "paid"
                            ? "#2ecc71"
                            : "#f39c12",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color:
                          order.paymentStatus === "paid"
                            ? "#2ecc71"
                            : "#f39c12",
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {order.paymentStatus === "paid"
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Shipping Information */}
        {order.shippingAddress && (
          <View style={styles.infoSection}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="location-outline" size={20} color="#3498db" />
              <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
            </View>

            <View style={styles.infoCard}>
              {order.shippingAddress.name && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Người nhận</Text>
                  <Text style={styles.infoValue}>
                    {order.shippingAddress.name}
                  </Text>
                </View>
              )}

              {order.shippingAddress.phone && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  <Text style={styles.infoValue}>
                    {order.shippingAddress.phone}
                  </Text>
                </View>
              )}

              {order.shippingAddress.address && (
                <View style={[styles.infoItem, styles.noBorder]}>
                  <Text style={styles.infoLabel}>Địa chỉ</Text>
                  <Text style={styles.infoValue}>
                    {order.shippingAddress.address}
                    {order.shippingAddress.district &&
                      `, ${order.shippingAddress.district}`}
                    {order.shippingAddress.city &&
                      `, ${order.shippingAddress.city}`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <View style={styles.itemsSection}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="cart-outline" size={20} color="#3498db" />
              <Text style={styles.sectionTitle}>Sản phẩm đã mua</Text>
            </View>

            {order.items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.productItem,
                  index === order.items.length - 1 ? styles.noBorder : {},
                ]}
              >
                <Image
                  source={{
                    uri: item.image || "https://via.placeholder.com/60",
                  }}
                  style={styles.productImage}
                  resizeMode="cover"
                />

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name || "Sản phẩm không xác định"}
                  </Text>
                  <Text style={styles.productPrice}>
                    {(item.price || 0).toLocaleString("vi-VN")} đ
                  </Text>
                  <Text style={styles.productQuantity}>
                    x{item.quantity || 1}
                  </Text>
                </View>

                <Text style={styles.productTotal}>
                  {((item.price || 0) * (item.quantity || 1)).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  đ
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="receipt-outline" size={20} color="#3498db" />
            <Text style={styles.sectionTitle}>Tổng hóa đơn</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>
                {(
                  order.subtotal ||
                  order.items?.reduce(
                    (sum, item) =>
                      sum + (item.price || 0) * (item.quantity || 1),
                    0
                  ) ||
                  0
                ).toLocaleString("vi-VN")}{" "}
                đ
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>
                {order.shippingMethod === "express" ? "30.000" : "60.000"} đ
              </Text>
            </View>

            {(order.discount > 0 || order.discount) && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá</Text>
                <Text style={styles.discountValue}>
                  -{(order.discount || 0).toLocaleString("vi-VN")} đ
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {totalAmount.toLocaleString("vi-VN")} đ
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {order.status === "pending" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setCancelModalVisible(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color="#e74c3c"
                style={styles.buttonIcon}
              />
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}

          {order.status === "delivered" && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() =>
                navigation.navigate("WriteReview", { orderId: order.id })
              }
            >
              <Ionicons
                name="star-outline"
                size={20}
                color="#f39c12"
                style={styles.buttonIcon}
              />
              <Text style={styles.reviewButtonText}>Đánh giá sản phẩm</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.supportButton,
              order.status === "pending" || order.status === "delivered"
                ? { flex: 1 }
                : { width: "100%" },
            ]}
            onPress={() =>
              navigation.navigate("CustomerSupport", { orderId: order.id })
            }
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
            <Text style={styles.supportButtonText}>Liên hệ hỗ trợ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Cancel Order Modal */}
      <Modal
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: modalTranslateY }],
                opacity: modalOpacity,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <MaterialIcons name="error-outline" size={46} color="#e74c3c" />
              <Text style={styles.modalTitle}>Xác nhận hủy đơn hàng</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Bạn có chắc chắn muốn hủy đơn hàng này không? Sau khi hủy, hệ
                thống sẽ cập nhật trạng thái đơn hàng và thông báo cho người
                bán.
              </Text>

              <View style={styles.orderSummaryInModal}>
                <Text style={styles.orderIdInModal}>
                  Mã đơn hàng: #
                  {order.id ? order.id.slice(-6) : orderId.slice(-6)}
                </Text>
                <Text style={styles.totalAmountInModal}>
                  Giá trị: {totalAmount.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setCancelModalVisible(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Không, giữ lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleCancelOrder}
                disabled={processingCancel}
              >
                {processingCancel ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>
                    Có, hủy đơn hàng
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// TimelineItem Component
const TimelineItem = ({
  title,
  time,
  status,
  isActive,
  isFirst = false,
  isLast = false,
}) => {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelinePoint,
            isActive ? styles.activePoint : styles.inactivePoint,
          ]}
        />

        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              isActive ? styles.activeLine : styles.inactiveLine,
            ]}
          />
        )}
      </View>

      <View style={styles.timelineContent}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineTime}>{time}</Text>
        <Text
          style={[
            styles.timelineStatus,
            { color: status === "Hoàn thành" ? "#2ecc71" : "#f39c12" },
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7f8c8d",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
  },
  errorButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  // Quick Info Bar
  quickInfoBar: {
    flexDirection: "row",
    backgroundColor: "white",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickInfoItem: {
    alignItems: "center",
    flex: 1,
  },
  quickInfoDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 5,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: "#95a5a6",
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  quickInfoValueTotal: {
    fontSize: 14,
    color: "#e74c3c",
    fontWeight: "700",
  },

  // Status Section
  statusSection: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 6,
  },
  statusDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },

  // Timeline Section
  timelineSection: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeline: {
    marginTop: 12,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  timelineLeft: {
    width: 24,
    alignItems: "center",
  },
  timelinePoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
  },
  activePoint: {
    backgroundColor: "#3498db",
    borderColor: "#e1f0fa",
  },
  inactivePoint: {
    backgroundColor: "#bdc3c7",
    borderColor: "#ecf0f1",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  activeLine: {
    backgroundColor: "#3498db",
  },
  inactiveLine: {
    backgroundColor: "#bdc3c7",
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 16,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 13,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  timelineStatus: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Section Styling
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    overflow: "hidden",
  },
  infoItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  infoLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  paymentStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  noBorder: {
    borderBottomWidth: 0,
  },

  // Order Items Section
  itemsSection: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: "#f1f2f6",
  },
  productInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  productTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },

  // Summary Section
  summarySection: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    overflow: "hidden",
    paddingVertical: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  discountValue: {
    fontSize: 14,
    color: "#e74c3c",
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },

  // Action Section
  actionSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#fff0f0",
    borderWidth: 1,
    borderColor: "#ffcece",
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#e74c3c",
    fontWeight: "600",
    fontSize: 14,
  },
  reviewButton: {
    flex: 1,
    backgroundColor: "#fff8e1",
    borderWidth: 1,
    borderColor: "#ffe082",
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewButtonText: {
    color: "#f39c12",
    fontWeight: "600",
    fontSize: 14,
  },
  supportButton: {
    flex: 1,
    backgroundColor: "#3498db",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  supportButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 12,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
  },
  orderSummaryInModal: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  orderIdInModal: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
    marginBottom: 6,
  },
  totalAmountInModal: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "bold",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
  },
  modalCancelButtonText: {
    color: "#7f8c8d",
    fontWeight: "600",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default OrderDetailScreen;
