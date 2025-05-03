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
import { database } from "../../config/firebaseConfig";
import { ref, push, set } from "firebase/database";
import { uploadToCloudinary } from "../../utils/uploadImage"; // ✅ Đổi lại tên hàm đúng

export default function AddCategoryScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // 💾 Lưu danh mục vào Firebase
  const handleAdd = async () => {
    if (!title.trim() || !image) {
      Alert.alert("⚠️ Lỗi", "Vui lòng nhập tiêu đề và chọn ảnh!");
      return;
    }

    setLoading(true);
    try {
      // 📤 Upload ảnh lên Cloudinary
      const imageUrl = await uploadToCloudinary(image);
      if (!imageUrl) throw new Error("Upload ảnh thất bại.");

      // 🔥 Lưu danh mục vào Firebase
      const newCategoryRef = push(ref(database, "categories"));
      await set(newCategoryRef, { title, image: imageUrl });

      Alert.alert("✅ Thành công", "Danh mục đã được thêm!");
      navigation.goBack();
    } catch (error) {
      console.error("❌ Lỗi khi thêm danh mục:", error);
      Alert.alert("⚠️ Lỗi", "Không thể lưu danh mục, vui lòng thử lại!");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ Thêm Danh Mục</Text>

      <TextInput
        style={styles.input}
        placeholder="📌 Nhập tiêu đề danh mục..."
        value={title}
        onChangeText={setTitle}
      />

      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>🖼 Chọn Ảnh</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleAdd}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>💾 Lưu</Text>
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
  imagePreview: {
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
  imageButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  saveButton: {
    backgroundColor: "#27ae60",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
