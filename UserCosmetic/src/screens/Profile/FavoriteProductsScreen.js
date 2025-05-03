import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../../context/FavoritesContext";
import { useNavigation } from "@react-navigation/native";

export default function FavoriteProductsScreen() {
  const { favorites, removeFromFavorites } = useFavorites();
  const navigation = useNavigation();

  const handleRemoveFavorite = (product) => {
    Alert.alert(
      "Xóa khỏi Yêu thích",
      "Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: () => removeFromFavorites(product.id),
          style: "destructive",
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() =>
        navigation.navigate("ProductDetailScreen", { product: item })
      }
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          {parseInt(item.price).toLocaleString()}₫
        </Text>
      </View>

      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleRemoveFavorite(item)}
      >
        <Ionicons name="heart" size={24} color="#FF5252" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>Bạn chưa có sản phẩm yêu thích nào</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.shopButtonText}>Khám phá sản phẩm</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "white",
    elevation: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 30,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 50,
  },
  productItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F08080",
  },
  favoriteButton: {
    justifyContent: "center",
    padding: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: "#F08080",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  shopButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
