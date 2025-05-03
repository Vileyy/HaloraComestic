import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";

export default function UserDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);

    // Subscribe to real-time updates
    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.val());
        } else {
          Alert.alert("Lỗi", "Không tìm thấy user!");
          navigation.goBack();
        }
      },
      (error) => {
        Alert.alert("Lỗi", error.message);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [userId]);

  const handleDeleteUser = () => {
    Alert.alert("Xóa User", "Bạn có chắc muốn xóa người dùng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          const db = getDatabase();
          remove(ref(db, `users/${userId}`))
            .then(() => {
              Alert.alert("Thành công", "Người dùng đã bị xóa!");
              navigation.goBack();
            })
            .catch((error) => Alert.alert("Lỗi", error.message));
        },
      },
    ]);
  };

  const toggleBanUser = () => {
    const newStatus = user.status === "banned" ? "active" : "banned";
    const db = getDatabase();
    update(ref(db, `users/${userId}`), { status: newStatus })
      .then(() => {
        Alert.alert(
          "Thành công",
          `Tài khoản đã được ${newStatus === "banned" ? "cấm" : "mở khóa"}!`
        );
        setUser((prev) => ({ ...prev, status: newStatus }));
      })
      .catch((error) => Alert.alert("Lỗi", error.message));
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user.photoURL && user.photoURL !== "" ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.avatar}
                onError={(e) =>
                  console.log("Avatar load error:", e.nativeEvent.error)
                }
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.defaultAvatarText}>
                  {user.displayName
                    ? user.displayName.charAt(0).toUpperCase()
                    : "U"}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    user.status === "active" ? "#4CAF50" : "#F44336",
                },
              ]}
            />
          </View>
          <Text style={styles.name}>{user.displayName || "Chưa cập nhật"}</Text>
          <Text style={styles.email}>{user.email || "Chưa cập nhật"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {user.displayName || "Chưa cập nhật"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user.email || "Chưa cập nhật"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user.phone || "Chưa cập nhật"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {user.address || "Chưa cập nhật"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="transgender-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {user.gender === "male"
                ? "Nam"
                : user.gender === "female"
                ? "Nữ"
                : user.gender === "other"
                ? "Khác"
                : user.gender
                ? user.gender
                : "Chưa cập nhật"}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("UserEditScreen", { userId })}
          >
            <Text style={styles.buttonText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.banButton} onPress={toggleBanUser}>
            <Text style={styles.buttonText}>
              {user.status === "banned"
                ? "Mở khóa tài khoản"
                : "Khóa tài khoản"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteUser}
          >
            <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
          </TouchableOpacity>
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
    marginTop: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e1e4e8",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#8c939d",
  },
  statusIndicator: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    bottom: 0,
    right: 0,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 15,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  buttonContainer: {
    padding: 15,
    marginTop: 15,
  },
  editButton: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  banButton: {
    backgroundColor: "#f39c12",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "#f4f6f8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButtonText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "bold",
  },
});
