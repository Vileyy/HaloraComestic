import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions,
  ToastAndroid,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../context/CartContext"; // Import context
import { useFavorites } from "../../context/FavoritesContext"; // Import favorites context

const { width } = Dimensions.get("window");

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params || {}; // Kiểm tra product có tồn tại không
  const { cart, addToCart } = useCart(); // Lấy giỏ hàng từ context
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites(); // Lấy favorites từ context
  const [showFlyImage, setShowFlyImage] = useState(false);
  const [isFavoriteProduct, setIsFavoriteProduct] = useState(false);

  // Animation
  const animatedValue = useRef(new Animated.Value(1)).current;
  const flyAnimation = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Cập nhật trạng thái yêu thích khi component mount
  useEffect(() => {
    if (product && product.id) {
      const favoriteStatus = isFavorite(product.id);
      setIsFavoriteProduct(favoriteStatus);
    }
  }, [product, isFavorite]);

  const handleAddToCart = (event) => {
    if (!product) return; // Tránh lỗi khi product chưa có dữ liệu

    event.target.measure((fx, fy, width, height, px, py) => {
      flyAnimation.setValue({ x: px, y: py });
      animatedValue.setValue(1);
      setShowFlyImage(true);

      Animated.parallel([
        Animated.timing(flyAnimation, {
          toValue: { x: 300, y: 50 }, // Bay lên vị trí icon giỏ hàng
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowFlyImage(false);
        addToCart(product); // Thêm sản phẩm vào giỏ hàng trong context
      });
    });
  };

  // const handleBuyNow = () => {
  //   if (!product) {
  //     console.error("Product không hợp lệ!");
  //     return;
  //   }

  //   // Thêm sản phẩm vào giỏ hàng
  //   addToCart(product);

  //   // Chuyển người dùng đến trang thanh toán ngay lập tức
  //   navigation.navigate("Checkout", {
  //     screen: "CheckoutScreen",
  //     params: {
  //       products: [product],
  //       totalAmount: parseInt(product.price),
  //       fromBuyNow: true, // Thông tin đánh dấu để xác định từ nút "Mua ngay"
  //     },
  //   });
  // };

  const toggleFavorite = () => {
    if (!product || !product.id) return;

    if (isFavoriteProduct) {
      removeFromFavorites(product.id);
      ToastAndroid.show("Đã xóa khỏi danh sách yêu thích", ToastAndroid.SHORT);
    } else {
      addToFavorites(product);
      ToastAndroid.show("Đã thêm vào danh sách yêu thích", ToastAndroid.SHORT);
    }

    setIsFavoriteProduct(!isFavoriteProduct);
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F08080" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#F08080" />

      {/* Thanh điều hướng */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.rightIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Cart")}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="cart-outline" size={22} color="#F08080" />
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartCount}>{cart.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={isFavoriteProduct ? "heart" : "heart-outline"}
                size={22}
                color={isFavoriteProduct ? "#FF5252" : "#F08080"}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.iconCircle}>
              <Ionicons name="share-social-outline" size={20} color="#F08080" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} />
        </View>

        <View style={styles.detailsContainer}>
          {/* Thông tin cơ bản */}
          <View style={styles.basicInfoContainer}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>
              {parseInt(product.price).toLocaleString()}₫
            </Text>

            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= 4 ? "star" : "star-outline"}
                    size={16}
                    color={star <= 4 ? "#FFB800" : "#ccc"}
                    style={styles.starIcon}
                  />
                ))}
                <Text style={styles.ratingText}>4.0</Text>
              </View>
              <Text style={styles.soldCount}>Đã bán 128</Text>
            </View>
          </View>

          {/* Thông tin vận chuyển */}
          <View style={styles.deliveryContainer}>
            <View style={styles.deliveryRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color="#666"
                style={styles.deliveryIcon}
              />
              <Text style={styles.deliveryTitle}>Địa điểm chi nhánh:</Text>
              <Text style={styles.deliveryValue}>
                82 Hồ Tùng Mậu, P.Bến Nghé, Q.1, TP.HCM
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#F08080" />
            </View>

            <View style={styles.divider} />

            <View style={styles.deliveryRow}>
              <Ionicons
                name="time-outline"
                size={18}
                color="#666"
                style={styles.deliveryIcon}
              />
              <Text style={styles.deliveryTitle}>Thời gian giao:</Text>
              <Text style={styles.deliveryValue}>24h - 48h</Text>
            </View>
          </View>

          {/* Mô tả sản phẩm */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Thông tin chi tiết */}
          <View style={styles.specSection}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Thương hiệu</Text>
              <Text style={styles.specValue}>Halora</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Xuất xứ</Text>
              <Text style={styles.specValue}>Việt Nam</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Chất liệu</Text>
              <Text style={styles.specValue}>Cao cấp</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Bảo hành</Text>
              <Text style={styles.specValue}>12 tháng</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Animation sản phẩm bay vào giỏ hàng */}
      {showFlyImage && (
        <Animated.Image
          source={{ uri: product.image }}
          style={[
            styles.flyImage,
            {
              transform: [
                { translateX: flyAnimation.x },
                { translateY: flyAnimation.y },
                { scale: animatedValue },
              ],
            },
          ]}
        />
      )}

      {/* Floating Cart Button */}
      <TouchableOpacity
        style={styles.floatingCartButton}
        onPress={() => navigation.navigate("Cart")}
      >
        <Ionicons name="cart" size={24} color="#fff" />
        {cart.length > 0 && (
          <View style={styles.floatingCartBadge}>
            <Text style={styles.floatingCartCount}>{cart.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Nút Thêm vào giỏ hàng & Mua ngay */}
      <View style={styles.fixedButtonContainer}>
        <View style={styles.buttonsWrapper}>
          <TouchableOpacity style={styles.chatButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#666" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={(event) => handleAddToCart(event)}
          >
            <Ionicons name="cart-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>Thêm vào giỏ</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.buyNowButton}>
            <Ionicons name="flash-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>Mua ngay</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F08080",
  },
  backButton: {
    padding: 6,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
    position: "relative",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF5252",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  cartCount: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  floatingCartButton: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F08080",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 999,
  },
  floatingCartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF5252",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  floatingCartCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 80,
  },
  imageContainer: {
    backgroundColor: "#fff",
    width: "100%", // Đảm bảo container chiếm toàn bộ chiều rộng
    height: width, // Đặt chiều cao bằng chiều rộng màn hình để tạo hình vuông
    alignItems: "center",
    justifyContent: "center",
    padding: 0, // Loại bỏ padding
  },
  image: {
    width: "100%", // Chiếm toàn bộ chiều rộng container
    height: "100%", // Chiếm toàn bộ chiều cao container
    resizeMode: "cover", // Thay đổi từ "contain" thành "cover" để ảnh phủ kín
  },
  detailsContainer: {
    backgroundColor: "#f5f5f5",
  },
  basicInfoContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 26,
  },
  price: {
    fontSize: 22,
    color: "#F08080",
    fontWeight: "bold",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  soldCount: {
    fontSize: 14,
    color: "#666",
  },
  deliveryContainer: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  deliveryIcon: {
    marginRight: 8,
  },
  deliveryTitle: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
    width: 100,
  },
  deliveryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  descriptionSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  specSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  specRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  specLabel: {
    width: 120,
    fontSize: 14,
    color: "#666",
  },
  specValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonsWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatButton: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginRight: 10,
  },
  buyNowButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F08080",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
  },
  flyImage: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: "contain",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "#eee",
  },
});

export default ProductDetailScreen;
