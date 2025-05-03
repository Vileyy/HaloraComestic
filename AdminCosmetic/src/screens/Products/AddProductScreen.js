import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { addProductToFirebase } from "../../services/firebaseServices";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../../config";

export default function AddProductScreen({ navigation }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Cập nhật danh mục
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([
    { label: "Flash Deals", value: "FlashDeals" }, 
    { label: "Sản phẩm mới", value: "new_products" },
    { label: "Bán chạy", value: "best_seller" },
  ]);

  // 🖼 Chọn ảnh từ thư viện
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

  // 💾 Upload ảnh lên Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "product_image.jpg",
    });
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();
      if (!data.secure_url) throw new Error("Upload thất bại.");
      return data.secure_url;
    } catch (error) {
      console.error("❌ Lỗi khi tải ảnh lên Cloudinary:", error);
      return null;
    }
  };

  // 💰 Định dạng giá tiền
  const formatPrice = (value) => {
    const numericValue = value.replace(/\D/g, "");
    return Number(numericValue).toLocaleString("vi-VN");
  };

  // 🛍 Thêm sản phẩm vào Firebase
  const handleAddProduct = async () => {
    if (!name || !description || !price || !image || !category) {
      Alert.alert("⚠️ Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    console.log("📂 Danh mục được chọn:", category);

    setLoading(true);

    try {
      const imageUrl = await uploadImageToCloudinary(image);
      if (!imageUrl) {
        throw new Error("Không thể tải ảnh lên Cloudinary.");
      }

      console.log("🟢 Dữ liệu gửi lên Firebase:", {
        name,
        price: price.replace(/\D/g, ""),
        description,
        imageUrl,
        category,
      });

      await addProductToFirebase(
        name,
        price.replace(/\D/g, ""),
        description,
        imageUrl,
        category
      );

      Alert.alert("✅ Thành công", "Sản phẩm đã được thêm!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("❌ Lỗi", "Không thể thêm sản phẩm!");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🆕 Thêm Sản Phẩm</Text>

      <TextInput
        style={styles.input}
        placeholder="📌 Tên sản phẩm"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="💰 Giá sản phẩm (VNĐ)"
        value={price}
        onChangeText={(text) => setPrice(formatPrice(text))}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="📝 Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* 🏷 Dropdown chọn danh mục */}
      <DropDownPicker
        open={open}
        value={category}
        items={categories}
        setOpen={setOpen}
        setValue={setCategory}
        setItems={setCategories}
        placeholder="📂 Chọn danh mục"
        containerStyle={{ marginBottom: 10 }}
      />

      {image && <Image source={{ uri: image }} style={styles.productImage} />}

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>🖼 Chọn Ảnh</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddProduct}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>✅ Thêm</Text>
        )}
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
    fontSize: 16,
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
  addButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
