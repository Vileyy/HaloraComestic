import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // 🛠 Thêm Picker
import * as ImagePicker from "expo-image-picker";
import { updateProductInFirebase } from "../../services/firebaseServices";

export default function EditProductScreen({ navigation, route }) {
  const { product } = route.params;

  // 📝 State cho sản phẩm
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price)); // Convert price về string
  const [description, setDescription] = useState(product.description);
  const [image, setImage] = useState(product.image);
  const [category, setCategory] = useState(product.category || "flash_sale"); // ✅ Thêm state cho category

  // 📷 Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 💾 Hàm lưu sản phẩm vào Firebase
  const handleSave = async () => {
    if (!name || !price || !description || !category) {
      Alert.alert("⚠️ Lỗi", "Vui lòng nhập đầy đủ thông tin sản phẩm!");
      return;
    }

    try {
      const updatedProduct = {
        name,
        price: Number(price), // Chuyển về số
        description,
        image,
        category, // ✅ Thêm category vào cập nhật
      };

      await updateProductInFirebase(product.id, updatedProduct);
      Alert.alert("✅ Thành công", "Sản phẩm đã được cập nhật!");
      navigation.goBack();
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
      Alert.alert("❌ Lỗi", "Không thể cập nhật sản phẩm, vui lòng thử lại!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ Chỉnh Sửa Sản Phẩm</Text>

      <TextInput
        style={styles.input}
        placeholder="📌 Tên sản phẩm"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="💰 Giá sản phẩm"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="📝 Mô tả sản phẩm"
        value={description}
        onChangeText={setDescription}
      />

      {/* 🏷 Chọn danh mục */}
      <Text style={styles.label}>🏷 Chọn danh mục:</Text>
      <Picker
        selectedValue={category}
        style={styles.picker}
        onValueChange={(itemValue) => setCategory(itemValue)}
      >
        <Picker.Item label="🔥 Flash Sale" value="flash_sale" />
        <Picker.Item label="⭐ Bán Chạy" value="best_seller" />
        <Picker.Item label="🆕 Sản Phẩm Mới" value="new_product" />
      </Picker>

      {/* 🖼 Ảnh sản phẩm */}
      {image && <Image source={{ uri: image }} style={styles.productImage} />}
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>🖼 Chọn Ảnh</Text>
      </TouchableOpacity>

      {/* 💾 Nút Lưu */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>💾 Lưu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: "#f39c12",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#27ae60",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  label: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
