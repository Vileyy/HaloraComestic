import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  StatusBar,
  Dimensions,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const cardWidth = width * 0.45;

const ViewAllScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, title } = route.params;
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    const db = getDatabase();
    const productsRef = ref(db, "products");

    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const productList = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .filter((item) => item.category === category);

        setProducts(productList);
        setFilteredProducts(productList);
      }
    });

    return () => unsubscribe();
  }, [category]);

  useEffect(() => {
    let filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOrder === "lowToHigh") {
      filtered.sort((a, b) => parseInt(a.price) - parseInt(b.price));
    } else if (sortOrder === "highToLow") {
      filtered.sort((a, b) => parseInt(b.price) - parseInt(a.price));
    }

    setFilteredProducts(filtered);
  }, [searchQuery, sortOrder, products]);

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productContainer}
      onPress={() =>
        navigation.navigate("ProductDetailScreen", { product: item })
      }
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          {parseInt(item.price).toLocaleString("vi-VN")} VNĐ
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.sortContainer}>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOrder === "default" && styles.activeSortButton,
            ]}
            onPress={() => handleSort("default")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortOrder === "default" && styles.activeSortButtonText,
              ]}
            >
              Mặc định
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOrder === "lowToHigh" && styles.activeSortButton,
            ]}
            onPress={() => handleSort("lowToHigh")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortOrder === "lowToHigh" && styles.activeSortButtonText,
              ]}
            >
              Giá tăng dần
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOrder === "highToLow" && styles.activeSortButton,
            ]}
            onPress={() => handleSort("highToLow")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortOrder === "highToLow" && styles.activeSortButtonText,
              ]}
            >
              Giá giảm dần
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} sản phẩm
        </Text>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
          </View>
        }
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
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  sortContainer: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sortButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
  },
  activeSortButton: {
    backgroundColor: "#e74c3c",
  },
  sortButtonText: {
    fontSize: 13,
    color: "#666",
  },
  activeSortButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  resultsInfo: {
    padding: 15,
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
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  productContainer: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    overflow: "hidden",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    height: 40,
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

export default ViewAllScreen;
