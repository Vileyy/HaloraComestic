import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getDatabase, ref, get, update } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";

const EditNotificationScreen = ({ route, navigation }) => {
  const { notificationId } = route.params;
  const [loading, setLoading] = useState(true);
  const [savingLoading, setSavingLoading] = useState(false);
  const [notification, setNotification] = useState({
    title: "",
    content: "",
    important: false,
  });
  const [isEdited, setIsEdited] = useState(false);
  const [originalNotification, setOriginalNotification] = useState(null);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const db = getDatabase();
        const notificationRef = ref(db, `notifications/${notificationId}`);
        const snapshot = await get(notificationRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const notificationData = {
            title: data.title || "",
            content: data.content || "",
            important: data.important || false,
          };
          setNotification(notificationData);
          setOriginalNotification(notificationData);
          setLoading(false);
        } else {
          Alert.alert("Lỗi", "Không tìm thấy thông báo");
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert("Lỗi", `Không thể tải thông báo: ${error.message}`);
        navigation.goBack();
      }
    };

    fetchNotification();
  }, [notificationId, navigation]);

  useEffect(() => {
    if (originalNotification) {
      const edited =
        notification.title !== originalNotification.title ||
        notification.content !== originalNotification.content ||
        notification.important !== originalNotification.important;
      setIsEdited(edited);
    }
  }, [notification, originalNotification]);

  const handleSave = async () => {
    if (!notification.title || notification.title.trim() === "") {
      Alert.alert("Lỗi", "Tiêu đề không được để trống");
      return;
    }

    if (!notification.content || notification.content.trim() === "") {
      Alert.alert("Lỗi", "Nội dung không được để trống");
      return;
    }

    try {
      setSavingLoading(true);
      const db = getDatabase();
      const notificationRef = ref(db, `notifications/${notificationId}`);

      await update(notificationRef, {
        title: notification.title.trim(),
        content: notification.content.trim(),
        important: notification.important,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert("Thành công", "Đã cập nhật thông báo", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setSavingLoading(false);
      Alert.alert("Lỗi", `Không thể cập nhật thông báo: ${error.message}`);
    }
  };

  const handleCancel = () => {
    if (isEdited) {
      Alert.alert(
        "Xác nhận hủy",
        "Bạn đã thay đổi thông tin. Bạn có chắc muốn hủy bỏ các thay đổi không?",
        [
          { text: "Ở lại", style: "cancel" },
          { text: "Hủy bỏ", onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleTextChange = (field, value) => {
    setNotification((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa thông báo</Text>
          <TouchableOpacity
            style={[
              styles.saveHeaderButton,
              (!isEdited || savingLoading) && styles.disabledHeaderButton,
            ]}
            onPress={handleSave}
            disabled={!isEdited || savingLoading}
          >
            {savingLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="checkmark" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Tiêu đề</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề thông báo"
                value={notification.title}
                onChangeText={(text) => handleTextChange("title", text)}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nội dung</Text>
              <TextInput
                style={[styles.input, styles.contentInput]}
                placeholder="Nhập nội dung thông báo"
                value={notification.content}
                onChangeText={(text) => handleTextChange("content", text)}
                multiline
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Ionicons
                  name={
                    notification.important
                      ? "alert-circle"
                      : "alert-circle-outline"
                  }
                  size={24}
                  color={notification.important ? "#FFC107" : "#666"}
                  style={styles.switchIcon}
                />
                <View>
                  <Text style={styles.switchLabel}>Thông báo quan trọng</Text>
                  <Text style={styles.switchDescription}>
                    Thông báo quan trọng sẽ được đánh dấu để nổi bật
                  </Text>
                </View>
              </View>
              <Switch
                value={notification.important}
                onValueChange={(value) => handleTextChange("important", value)}
                trackColor={{ false: "#e0e0e0", true: "#81c784" }}
                thumbColor={notification.important ? "#4CAF50" : "#f5f5f5"}
              />
            </View>

            <View style={styles.infoContainer}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#666"
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                Thông báo này được tạo vào{" "}
                {new Date(
                  originalNotification?.createdAt || new Date()
                ).toLocaleString()}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Ionicons name="close-circle-outline" size={20} color="#666" />
                <Text style={styles.cancelButtonText}>Hủy thay đổi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  (!isEdited || savingLoading) && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={!isEdited || savingLoading}
              >
                {savingLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2196F3",
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#2196F3",
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  saveHeaderButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledHeaderButton: {
    opacity: 0.5,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  formContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  contentInput: {
    height: 150,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
  },
  switchInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  switchIcon: {
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  switchDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#a5d6a7",
    opacity: 0.7,
  },
});

export default EditNotificationScreen;
