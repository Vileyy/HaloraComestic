import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { firebase } from "../../../firebaseConfig";
import { getDatabase, ref, set, push, remove, get } from "firebase/database";

const CheckoutScreen = ({ route, navigation }) => {
  const { cartItems } = route.params;
  const [discountCode, setDiscountCode] = useState("");
  const [note, setNote] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isLoading, setIsLoading] = useState(false);

  // Get current user ID - assume user is logged in
  const currentUser = firebase.auth().currentUser;
  const userId = currentUser ? currentUser.uid : "guest";

  // Tính tổng tiền sản phẩm
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Phí vận chuyển
  const getShippingFee = () => {
    return shippingMethod === "standard" ? 30000 : 60000;
  };

  // Tính tổng tiền đơn hàng
  const calculateTotal = () => {
    return calculateSubtotal() + getShippingFee();
  };

  // Format tiền VND
  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + " ₫";
  };

  // Clear cart after successful order
  const clearCart = async () => {
    try {
      const db = getDatabase();
      const cartRef = ref(db, `users/${userId}/cart`);

      // Get current cart items
      const cartSnapshot = await get(cartRef);
      const currentCart = cartSnapshot.val() || [];

      // Filter out the items that were just paid for
      const remainingItems = currentCart.filter(
        (item) => !cartItems.some((paidItem) => paidItem.id === item.id)
      );

      // Update cart with remaining items
      await set(cartRef, remainingItems);
      console.log("Đã xóa các sản phẩm đã thanh toán khỏi giỏ hàng");
    } catch (error) {
      console.error("Lỗi khi cập nhật giỏ hàng:", error);
    }
  };

  // Save order to Firebase Realtime Database
  const saveOrderToFirebase = async () => {
    setIsLoading(true);
    try {
      // Get database reference
      const db = getDatabase();

      // Create a new order ID
      const orderListRef = ref(db, "orders");
      const newOrderRef = push(orderListRef);
      const orderId = newOrderRef.key;

      // Generate order details
      const orderData = {
        userId: userId,
        orderItems: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingMethod: shippingMethod,
        shippingFee: getShippingFee(),
        paymentMethod: paymentMethod,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        note: note,
        discountCode: discountCode,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save the order data
      await set(newOrderRef, orderData);

      // Also save reference to user's orders with items info for direct access
      const userOrderRef = ref(db, `users/${userId}/orders/${orderId}`);
      await set(userOrderRef, {
        orderId: orderId,
        total: calculateTotal(),
        status: "pending",
        createdAt: new Date().toISOString(),
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      });

      // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
      await clearCart();

      setIsLoading(false);

      // Navigate to success screen with order ID
      navigation.navigate("OrderSuccessScreen", {
        orderId: orderId,
        total: calculateTotal(),
      });
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.", [
        { text: "OK" },
      ]);
      console.error("Error saving order: ", error);
    }
  };

  const handlePlaceOrder = () => {
    // Validate order if needed
    if (cartItems.length === 0) {
      Alert.alert("Lỗi", "Giỏ hàng của bạn đang trống");
      return;
    }

    // Confirm order
    Alert.alert(
      "Xác nhận đặt hàng",
      `Bạn có chắc chắn muốn đặt đơn hàng với tổng tiền ${formatCurrency(
        calculateTotal()
      )}?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đặt hàng", onPress: saveOrderToFirebase },
      ]
    );
  };

  const renderPaymentMethod = (method, icon, label) => {
    return (
      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === method && styles.selectedPaymentOption,
        ]}
        onPress={() => setPaymentMethod(method)}
      >
        <View style={styles.paymentOptionContent}>
          {icon}
          <Text style={styles.paymentLabel}>{label}</Text>
        </View>
        <View
          style={[
            styles.radioButton,
            paymentMethod === method && styles.radioButtonSelected,
          ]}
        >
          {paymentMethod === method && <View style={styles.radioButtonInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thanh Toán</Text>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sản phẩm đã chọn</Text>
          {cartItems.map((item) => (
            <View key={item.id.toString()} style={styles.product}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productPrice}>
                    {formatCurrency(item.price)}
                  </Text>
                  <Text style={styles.productQuantity}>x{item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Mã giảm giá */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mã giảm giá</Text>
          <View style={styles.discountContainer}>
            <View style={styles.inputWithIcon}>
              <MaterialIcons
                name="local-offer"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.discountInput}
                placeholder="Nhập mã giảm giá"
                value={discountCode}
                onChangeText={setDiscountCode}
              />
            </View>
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Phương thức vận chuyển */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
          <TouchableOpacity
            style={[
              styles.shippingOption,
              shippingMethod === "standard" && styles.selectedShippingOption,
            ]}
            onPress={() => setShippingMethod("standard")}
          >
            <View style={styles.shippingOptionContent}>
              <FontAwesome5 name="shipping-fast" size={18} color="#555" />
              <View style={styles.shippingOptionInfo}>
                <Text style={styles.shippingOptionTitle}>
                  Giao hàng tiêu chuẩn
                </Text>
                <Text style={styles.shippingOptionDesc}>
                  Nhận hàng trong 3-5 ngày
                </Text>
              </View>
            </View>
            <Text style={styles.shippingFee}>{formatCurrency(30000)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shippingOption,
              shippingMethod === "express" && styles.selectedShippingOption,
            ]}
            onPress={() => setShippingMethod("express")}
          >
            <View style={styles.shippingOptionContent}>
              <Ionicons name="rocket-outline" size={22} color="#555" />
              <View style={styles.shippingOptionInfo}>
                <Text style={styles.shippingOptionTitle}>Giao hàng nhanh</Text>
                <Text style={styles.shippingOptionDesc}>
                  Nhận hàng trong 1-2 ngày
                </Text>
              </View>
            </View>
            <Text style={styles.shippingFee}>{formatCurrency(60000)}</Text>
          </TouchableOpacity>
        </View>

        {/* Phương thức thanh toán */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {renderPaymentMethod(
            "cod",
            <FontAwesome5
              name="money-bill-wave"
              size={20}
              color="#4CAF50"
              style={styles.paymentIcon}
            />,
            "Thanh toán khi nhận hàng (COD)"
          )}
          {renderPaymentMethod(
            "momo",
            <Image
              source={{
                uri: "https://download.logo.wine/logo/MoMo_(company)/MoMo_(company)-Logo.wine.png",
              }}
              style={styles.momoIcon}
            />,
            "Ví MoMo"
          )}
          {renderPaymentMethod(
            "vnpay",
            <Image
              source={{
                uri: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png",
              }}
              style={styles.vnpayIcon}
            />,
            "VNPay"
          )}
        </View>

        {/* Ghi chú */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <View style={styles.noteContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Ghi chú cho người bán..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Tóm tắt đơn hàng */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(calculateSubtotal())}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(getShippingFee())}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(calculateTotal())}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Nút thanh toán cố định ở dưới */}
      <View style={styles.checkoutButtonContainer}>
        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceLabel}>Tổng cộng:</Text>
          <Text style={styles.totalPriceValue}>
            {formatCurrency(calculateTotal())}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handlePlaceOrder}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.checkoutButtonText}>Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  product: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginBottom: 5,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ff4757",
  },
  productQuantity: {
    fontSize: 14,
    color: "#888",
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWithIcon: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    marginHorizontal: 10,
  },
  discountInput: {
    flex: 1,
    height: 45,
    paddingVertical: 8,
  },
  applyButton: {
    backgroundColor: "#ff6f61",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  applyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  shippingOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  selectedShippingOption: {
    borderColor: "#ff6f61",
    backgroundColor: "#fff5f5",
  },
  shippingOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  shippingOptionInfo: {
    marginLeft: 12,
  },
  shippingOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  shippingOptionDesc: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  shippingFee: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  selectedPaymentOption: {
    borderColor: "#ff6f61",
    backgroundColor: "#fff5f5",
  },
  paymentOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    marginRight: 12,
  },
  momoIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  vnpayIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#ff6f61",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff6f61",
  },
  noteContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  noteInput: {
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 80,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 80,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff4757",
  },
  checkoutButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  totalPriceContainer: {
    flex: 1,
  },
  totalPriceLabel: {
    fontSize: 13,
    color: "#666",
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff4757",
  },
  checkoutButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CheckoutScreen;
