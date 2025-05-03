import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addBannerToFirebase } from "../../services/firebaseServices";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const AddBannerScreen = () => {
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [16, 9],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title || !imageUri) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề và chọn ảnh banner.");
      return;
    }

    try {
      setIsLoading(true);
      await addBannerToFirebase(title, imageUri, linkUrl);
      Alert.alert("Thành công", "Banner đã được thêm vào hệ thống.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm banner. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm Banner Mới</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formContainer}>
          {/* Phần chọn ảnh */}
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={handlePickImage}
                >
                  <Text style={styles.changeImageText}>Thay đổi ảnh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.imagePicker} 
                onPress={handlePickImage}
              >
                <Ionicons name="image-outline" size={48} color="#aaa" />
                <Text style={styles.imagePickerText}>Chọn ảnh banner</Text>
                <Text style={styles.imagePickerSubtext}>Định dạng khuyến nghị: 16:9</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Phần thông tin */}
          <View style={styles.infoSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiêu đề Banner</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề cho banner"
                placeholderTextColor="#aaa"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Liên kết (nếu có)</Text>
              <TextInput
                value={linkUrl}
                onChangeText={setLinkUrl}
                placeholder="https://example.com"
                placeholderTextColor="#aaa"
                keyboardType="url"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.cancelButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.saveButtonText}>Đang lưu...</Text>
          ) : (
            <View style={styles.saveButtonContent}>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Lưu Banner</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoSection: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
  },
  imagePicker: {
    height: 200,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  imagePickerText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  imagePickerSubtext: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
  },
  imageContainer: {
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#ff4081",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: "#ffb6c1",
  },
});

export default AddBannerScreen;