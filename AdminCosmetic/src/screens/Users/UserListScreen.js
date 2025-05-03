import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";

export default function UserListScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    onValue(usersRef, (snapshot) => {
      setLoading(true);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setUsers(userList);
      }
      setLoading(false);
    });
  }, []);

  // Render mỗi user
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("UserDetailScreen", { userId: item.id })
      }
    >
      <View style={styles.avatarContainer}>
        {item.photoURL && item.photoURL !== "" ? (
          <Image
            source={{ uri: item.photoURL }}
            style={styles.avatar}
            onError={(e) =>
              console.log("Avatar load error:", e.nativeEvent.error)
            }
          />
        ) : (
          <View style={styles.defaultAvatar}>
            <Text style={styles.defaultAvatarText}>
              {item.displayName
                ? item.displayName.charAt(0).toUpperCase()
                : "U"}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: item.status === "active" ? "#4CAF50" : "#F44336",
            },
          ]}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.displayName || "Chưa cập nhật"}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={14} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.email || "Chưa cập nhật"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.phone || "Chưa cập nhật"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.address || "Chưa cập nhật"}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#bbb" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Danh sách người dùng</Text>
        <Text style={styles.subtitle}>{users.length} người dùng</Text>
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Không có người dùng nào</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 30,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e1e4e8",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8c939d",
  },
  statusIndicator: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#fff",
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});
