import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { database } from "../../config/firebaseConfig";
import { ref, update } from "firebase/database";

export default function EditBrandScreen({ navigation, route }) {
  const { brand } = route.params;
  const [image, setImage] = useState(brand.image);

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

  const handleUpdate = async () => {
    if (!image) return alert("⚠️ Vui lòng chọn hình ảnh!");

    await update(ref(database, `brands/${brand.id}`), { image });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏️ Chỉnh sửa Thương Hiệu</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Image source={{ uri: image }} style={styles.image} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
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
    alignItems: "center",
  },
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
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: "#f39c12",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
