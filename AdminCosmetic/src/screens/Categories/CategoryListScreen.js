import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { database } from "../../config/firebaseConfig";
import { ref, onValue, remove } from "firebase/database";

export default function CategoryListScreen({ navigation }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const categoryRef = ref(database, "categories");

    onValue(categoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const categoryArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCategories(categoryArray);
      } else {
        setCategories([]);
      }
    });
  }, []);

  // Xóa danh mục
  const handleDelete = (id) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa danh mục này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          await remove(ref(database, `categories/${id}`));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📂 Quản lý Danh mục</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Image source={{ uri: item.image }} style={styles.categoryImage} />
            <Text style={styles.categoryText}>{item.title}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("EditCategoryScreen", { category: item })
                }
              >
                <MaterialIcons name="edit" size={24} color="#f39c12" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <MaterialIcons name="delete" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Nút thêm danh mục */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddCategoryScreen")}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  categoryItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#27ae60",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
