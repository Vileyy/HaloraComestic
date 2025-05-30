import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getDatabase, ref, onValue, off } from "firebase/database";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeIn,
  SlideInDown,
  Layout,
  ZoomIn,
} from "react-native-reanimated";

const ExploreScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("name");

  useEffect(() => {
    const db = getDatabase();
    const productsRef = ref(db, "products");

    const fetchData = () => {
      onValue(productsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const productsArray = Object.keys(data)
            .map((key) => ({
              id: key,
              ...data[key],
            }))
            .filter((item) => item?.image && item?.name);
          setProducts(productsArray);
          setFilteredProducts(productsArray);
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
        setLoading(false);
      });
    };

    fetchData();
    return () => {
      off(productsRef);
    };
  }, []);

  // 🔎 Xử lý tìm kiếm
  const handleSearch = useCallback(
    (text) => {
      setSearchText(text);
      if (text.trim() === "") {
        setFilteredProducts(products);
      } else {
        const results = products.filter((item) =>
          item?.name?.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredProducts(results);
      }
    },
    [products]
  );

  // 🔽 Sắp xếp sản phẩm
  const sortProducts = useCallback(
    (type) => {
      let sorted = [...filteredProducts];

      if (type === "name") {
        sorted.sort((a, b) => a?.name?.localeCompare(b?.name));
      } else if (type === "price_asc") {
        sorted.sort(
          (a, b) => (parseFloat(a?.price) || 0) - (parseFloat(b?.price) || 0)
        );
      } else if (type === "price_desc") {
        sorted.sort(
          (a, b) => (parseFloat(b?.price) || 0) - (parseFloat(a?.price) || 0)
        );
      }

      setSortType(type);
      setFilteredProducts(sorted);
    },
    [filteredProducts]
  );

  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        {/* Thanh tìm kiếm */}
        <Animated.View
          entering={SlideInDown.delay(200)}
          style={styles.searchBar}
        >
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleSearch}
          />
        </Animated.View>
      </View>

      {/* Bộ lọc */}
      <Animated.View
        entering={FadeInDown.delay(300)}
        style={styles.filterContainer}
      >
        <Text style={styles.filterLabel}>Sắp xếp theo:</Text>
        <View style={styles.filtersWrapper}>
          {[
            { label: "Tên A-Z", type: "name", icon: "text-outline" },
            {
              label: "Giá thấp → cao",
              type: "price_asc",
              icon: "trending-up-outline",
            },
            {
              label: "Giá cao → thấp",
              type: "price_desc",
              icon: "trending-down-outline",
            },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.type}
              style={[
                styles.filterButton,
                sortType === filter.type && styles.activeFilter,
              ]}
              onPress={() => sortProducts(filter.type)}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={sortType === filter.type ? "#fff" : "#555"}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterText,
                  sortType === filter.type && styles.activeFilterText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Hiển thị số lượng kết quả */}
      <Animated.View
        entering={FadeInDown.delay(500)}
        style={styles.resultsCountContainer}
      >
        <Text style={styles.resultsCount}>
          {filteredProducts.length} sản phẩm
        </Text>
      </Animated.View>

      {/* Hiển thị loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6f61" />
        </View>
      ) : (
        <Animated.FlatList
          entering={FadeInDown.delay(600)}
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            if (!item?.image || !item?.name) return null;

            return (
              <TouchableOpacity
                style={styles.productItem}
                onPress={() => {
                  navigation.navigate("ProductDetailScreen", { product: item });
                }}
                activeOpacity={0.9}
              >
                <Animated.View
                  entering={FadeInDown.delay(index * 100)}
                  style={styles.imageContainer}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                  />
                </Animated.View>
                <Animated.View
                  entering={FadeInDown.delay(index * 100 + 200)}
                  style={styles.productInfo}
                >
                  <Text
                    style={styles.productName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {parseInt(item.price || 0).toLocaleString()}đ
                  </Text>
                  {item.description && (
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={styles.productDescription}
                    >
                      {item.description}
                    </Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  filterContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  filtersWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eaeaea",
    marginRight: 8,
  },
  filterIcon: {
    marginRight: 5,
  },
  activeFilter: {
    backgroundColor: "#ff6f61",
    borderColor: "#ff6f61",
  },
  activeFilterText: {
    color: "#fff",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
  },
  resultsCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: "500",
    color: "#777",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productsList: {
    padding: 8,

  },
  row: {
    justifyContent: "space-between",
  },
  productItem: {
    width: "48%",
    marginHorizontal: "1%",
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
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
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#ff6f61",
    fontWeight: "bold",
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 12,
    color: "#777",
    lineHeight: 16,
  },
});

export default ExploreScreen;
