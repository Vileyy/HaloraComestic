import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { database } from "../../config/firebaseConfig";
import { ref, update } from "firebase/database";
import { uploadToCloudinary } from "../../utils/uploadImage"; // Import hàm upload

export default function EditCategoryScreen({ navigation, route }) {
  const category = route.params?.category;
  const [title, setTitle] = useState(category?.title || "");
  const [image, setImage] = useState(category?.image || "");
  const [loading, setLoading] = useState(false);

  if (!category) {
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <Text style={styles.errorText}>Không tìm thấy thông tin danh mục</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    try {
      // Yêu cầu quyền truy cập thư viện ảnh
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần cấp quyền truy cập vào thư viện ảnh để tiếp tục');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        // Bắt đầu quá trình upload ảnh
        setLoading(true);
        try {
          const imageUrl = await uploadToCloudinary(result.assets[0].uri);
          if (imageUrl) {
            setImage(imageUrl);
            Alert.alert("Thành công", "Đã tải ảnh lên thành công!");
          } else {
            Alert.alert("Lỗi", "Không thể tải ảnh lên. Vui lòng thử lại sau.");
          }
        } catch (error) {
          Alert.alert("Lỗi", "Không thể tải ảnh lên: " + error.message);
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh');
      setLoading(false);
    }
  };

  // Cập nhật danh mục
  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('Thông báo', '⚠️ Vui lòng nhập tiêu đề danh mục!');
      return;
    }
    
    if (!image) {
      Alert.alert('Thông báo', '⚠️ Vui lòng chọn hình ảnh!');
      return;
    }

    try {
      setLoading(true);
      await update(ref(database, `categories/${category.id}`), {
        title,
        image,
      });
      
      Alert.alert('Thành công', 'Đã cập nhật danh mục thành công!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật danh mục: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ Chỉnh sửa Danh mục</Text>

      {/* Hiển thị ảnh */}
      <TouchableOpacity 
        onPress={pickImage} 
        style={styles.imagePicker}
        disabled={loading}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Chọn ảnh</Text>
          </View>
        )}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#f39c12" />
          </View>
        )}
        <Text style={styles.changeImageText}>📷 {loading ? 'Đang tải...' : 'Đổi ảnh'}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nhập tiêu đề danh mục..."
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.disabledButton]} 
        onPress={handleUpdate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>💾 Lưu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#f8f9fa", 
    alignItems: "center" 
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
  },
  changeImageText: {
    color: "#2980b9",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#f39c12",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
  },
});