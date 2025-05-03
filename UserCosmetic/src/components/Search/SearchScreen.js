import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const SearchScreen = ({ route, navigation }) => {
  const { initialSearch = "" } = route.params || {};
  const [search, setSearch] = useState(initialSearch);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const productsRef = ref(db, "products");

    onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const productsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setProducts(productsArray);
      }
    });
  }, []);

  const filterProducts = useCallback(
    (keyword, data) => {
      if (!keyword) {
        setFilteredProducts([]);
        return;
      }

      const filtered = data.filter((product) => {
        const name = product.name ? product.name.toLowerCase() : "";
        const category = product.category ? product.category.toLowerCase() : "";
        const brand = product.brand ? product.brand.toLowerCase() : "";

        return (
          name.includes(keyword.toLowerCase()) ||
          category.includes(keyword.toLowerCase()) ||
          brand.includes(keyword.toLowerCase())
        );
      });

      setFilteredProducts(filtered);
    },
    [setFilteredProducts]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (products.length > 0) {
        filterProducts(search, products);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, products]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
            autoFocus={true}
          />
          {search.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearch("")}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} kết quả tìm kiếm
        </Text>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productItem}
            onPress={() =>
              navigation.navigate("ProductDetailScreen", { product: item })
            }
          >
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.productBrand}>{item.brand}</Text>
              <Text style={styles.productDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={styles.productPrice}>
                {parseInt(item.price).toLocaleString("vi-VN")} VNĐ
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              {search.length > 0
                ? "Không tìm thấy sản phẩm phù hợp"
                : "Nhập từ khóa để tìm kiếm"}
            </Text>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
      />
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
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  resultsInfo: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
  },
  contentContainer: {
    padding: 12,
  },
  productItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 0,
  },
  productBrand: {
    fontSize: 13,
    color: "#666",
    marginBottom: 1,
  },
  productDescription: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
    lineHeight: 16,
  },
  productPrice: {
    fontSize: 15,
    color: "#e74c3c",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
});

export default SearchScreen;
