import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { database } from "../../config/firebaseConfig";
import { ref, onValue, remove } from "firebase/database";

export default function BrandListScreen({ navigation }) {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const brandRef = ref(database, "brands");

    onValue(brandRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const brandArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setBrands(brandArray);
      } else {
        setBrands([]);
      }
    });
  }, []);

  // Xóa thương hiệu
  const handleDelete = (id) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa thương hiệu này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          await remove(ref(database, `brands/${id}`));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏬 Quản lý Thương Hiệu</Text>

      <FlatList
        data={brands}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.brandItem}>
            <Image source={{ uri: item.image }} style={styles.brandImage} />
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("EditBrandScreen", { brand: item })
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

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddBrandScreen")}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  brandItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    flex: 1,
    margin: 5,
  },
  brandImage: {
    width: 160,
    height: 150,
    borderRadius: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
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
