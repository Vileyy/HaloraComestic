import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../context/CartContext";

const CartScreen = ({ navigation }) => {
  const { cart, updateQuantity, removeFromCart, toggleSelect } = useCart();

  const selectedItems = cart.filter((item) => item.selected);
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={100} color="#ddd" />
      <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
      <TouchableOpacity 
        style={styles.continueShoppingButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity 
        style={styles.selectButton} 
        onPress={() => toggleSelect(item.id)}
      >
        <Ionicons
          name={item.selected ? "checkmark-circle" : "ellipse-outline"}
          size={28}
          color={item.selected ? "#4CAF50" : "#bbb"}
        />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.productImage} />

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          {parseInt(item.price).toLocaleString()}₫
        </Text>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, item.quantity <= 1 && styles.disabledButton]}
            onPress={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Ionicons name="remove" size={20} color={item.quantity <= 1 ? "#ccc" : "#333"} />
          </TouchableOpacity>
          
          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>{item.quantity}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash-outline" size={24} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
        <View style={styles.headerRight} />
      </View>

      {cart.length === 0 ? (
        renderEmptyCart()
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCartItem}
          contentContainerStyle={styles.cartList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={styles.listFooterSpace} />}
        />
      )}

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.totalAmount}>{totalAmount.toLocaleString()}₫</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              selectedItems.length === 0 && styles.disabledCheckoutButton,
            ]}
            disabled={selectedItems.length === 0}
            onPress={() => {
              if (selectedItems.length > 0) {
                navigation.navigate("Checkout", { cartItems: selectedItems });
              } else {
                alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
              }
            }}
          >
            <Text style={styles.checkoutText}>Thanh toán ngay</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.checkoutIcon} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  headerRight: {
    width: 44,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  continueShoppingButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#ff4081",
    borderRadius: 8,
  },
  continueShoppingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  selectButton: {
    padding: 4,
    marginRight: 8,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF5252",
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
  },
  disabledButton: {
    backgroundColor: "#f5f5f5",
  },
  quantityDisplay: {
    minWidth: 40,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  listFooterSpace: {
    height: 100,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF5252",
  },
  checkoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff4081",
    borderRadius: 8,
    paddingVertical: 14,
  },
  disabledCheckoutButton: {
    backgroundColor: "#ff408166",
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  checkoutIcon: {
    marginLeft: 8,
  },
});

export default CartScreen;