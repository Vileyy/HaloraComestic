import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebaseConfig";
import { deleteProductFromFirebase } from "../../services/firebaseServices";

export default function ProductListScreen({ navigation }) {
  const [productsByCategory, setProductsByCategory] = useState({});

  // 🔄 Lấy danh sách sản phẩm từ Firebase và nhóm theo danh mục
  useEffect(() => {
    const productsRef = ref(database, "products/");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupedProducts = {};
        Object.keys(data).forEach((key) => {
          const product = { id: key, ...data[key] };
          if (!groupedProducts[product.category]) {
            groupedProducts[product.category] = [];
          }
          groupedProducts[product.category].push(product);
        });
        setProductsByCategory(groupedProducts);
      } else {
        setProductsByCategory({});
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📋 Danh Sách Sản Phẩm</Text>

      {/* Nút thêm sản phẩm */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddProductScreen")}
      >
        <Text style={styles.addButtonText}>➕ Thêm Sản Phẩm</Text>
      </TouchableOpacity>

      {/* Hiển thị sản phẩm theo danh mục */}
      {Object.keys(productsByCategory).map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>
            {category === "flash_sale"
              ? "⚡ Flash Deal"
              : category === "best_seller"
              ? "🔥 Bán chạy"
              : category}
          </Text>

          <FlatList
            data={productsByCategory[category]}
            keyExtractor={(item) => item.id}
            horizontal // ✅ Hiển thị ngang theo danh mục
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                  />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>
                    💰 {Number(item.price).toLocaleString("vi-VN")} đ
                  </Text>
                  <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
                </View>

                {/* Hàng ngang chứa nút "Sửa" và "Xóa" */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      navigation.navigate("EditProductScreen", {
                        product: item,
                      })
                    }
                  >
                    <Text style={styles.buttonText}>✏️ Sửa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteProductFromFirebase(item.id)}
                  >
                    <Text style={styles.buttonText}>❌ Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  addButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  productItem: {
    width: 150, // ✅ Định kích thước ngang cho sản phẩm
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 5,
  },
  productInfo: {
    marginTop: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productPrice: {
    fontSize: 14,
    color: "green",
    marginTop: 5,
  },
  productDescription:{
    fontSize: 12,
    marginTop: 6,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#f1c40f",
    padding: 5,
    borderRadius: 5,
    minWidth: 50,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    padding: 5,
    borderRadius: 5,
    minWidth: 50,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
