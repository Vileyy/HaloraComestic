import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { database } from "../../config/firebaseConfig";
import { ref, push, set } from "firebase/database";
import { uploadToCloudinary } from "../../utils/uploadImage"; // ✅ Đổi lại import đúng

export default function AddBrandScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAdd = async () => {
    if (!image) {
      Alert.alert("⚠️ Vui lòng chọn hình ảnh!");
      return;
    }

    setLoading(true);
    try {
      // 📤 Upload ảnh lên Cloudinary
      const imageUrl = await uploadToCloudinary(image);
      if (!imageUrl) throw new Error("Upload ảnh thất bại.");

      // 🔥 Lưu thương hiệu vào Firebase
      const newBrandRef = push(ref(database, "brands"));
      await set(newBrandRef, { image: imageUrl });

      Alert.alert("✅ Thành công", "Thương hiệu đã được thêm!");
      navigation.goBack();
    } catch (error) {
      console.error("❌ Lỗi khi thêm thương hiệu:", error);
      Alert.alert("⚠️ Lỗi", "Không thể lưu thương hiệu, vui lòng thử lại!");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ Thêm Thương Hiệu</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text>📷 Chọn Hình Ảnh</Text>
        )}
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
  imagePicker: {
    width: 150,
    height: 150,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  image: { width: "100%", height: "100%", borderRadius: 10 },
  saveButton: {
    backgroundColor: "#27ae60",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
