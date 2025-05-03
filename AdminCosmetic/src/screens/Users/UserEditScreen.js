import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { getDatabase, ref, get, update } from "firebase/database";

export default function UserEditScreen({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({});

  useEffect(() => {
    const db = getDatabase();
    get(ref(db, `users/${userId}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.val());
          setUpdatedUser(snapshot.val());
        } else {
          Alert.alert("Lỗi", "Không tìm thấy user!");
          navigation.goBack();
        }
      })
      .catch((error) => Alert.alert("Lỗi", error.message));
  }, [userId]);

  const handleUpdateUser = () => {
    const db = getDatabase();
    update(ref(db, `users/${userId}`), updatedUser)
      .then(() => {
        Alert.alert("Thành công", "Cập nhật thông tin thành công!");
        navigation.goBack();
      })
      .catch((error) => Alert.alert("Lỗi", error.message));
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chỉnh sửa thông tin</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={updatedUser.displayName}
              onChangeText={(text) =>
                setUpdatedUser({ ...updatedUser, displayName: text })
              }
              placeholder="Họ và tên"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={updatedUser.email}
              onChangeText={(text) =>
                setUpdatedUser({ ...updatedUser, email: text })
              }
              placeholder="Email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={updatedUser.phone}
              onChangeText={(text) =>
                setUpdatedUser({ ...updatedUser, phone: text })
              }
              placeholder="Số điện thoại"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={updatedUser.address}
              onChangeText={(text) =>
                setUpdatedUser({ ...updatedUser, address: text })
              }
              placeholder="Địa chỉ"
            />
          </View>

          <View style={styles.pickerContainer}>
            <Ionicons name="transgender-outline" size={20} color="#666" />
            <Picker
              selectedValue={updatedUser.gender || "other"}
              style={styles.picker}
              onValueChange={(itemValue) =>
                setUpdatedUser({ ...updatedUser, gender: itemValue })
              }
            >
              <Picker.Item label="Nam" value="Nam" />
              <Picker.Item label="Nữ" value="Nữ" />
              <Picker.Item label="Khác" value="Khác" />
            </Picker>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateUser}
            >
              <Text style={styles.buttonText}>Lưu thay đổi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  picker: {
    flex: 1,
    height: 50,
    marginLeft: 10,
  },
  buttonContainer: {
    padding: 15,
    marginTop: 15,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#f4f6f8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
  },
});
