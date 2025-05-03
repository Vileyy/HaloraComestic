import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove,
  query,
  orderByChild,
} from "firebase/database";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const NotificationListScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    important: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const notificationsRef = ref(db, "notifications");

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      setLoading(true);
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.entries(data).map(
          ([id, notification]) => ({
            id,
            ...notification,
            important: notification.important || false,
          })
        );
        // Sắp xếp thông báo theo thời gian tạo, mới nhất ở trên cùng
        notificationsList.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(notificationsList);
        setFilteredNotifications(notificationsList);
      } else {
        setNotifications([]);
        setFilteredNotifications([]);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Lọc thông báo khi searchTerm hoặc showImportantOnly thay đổi
  useEffect(() => {
    if (searchTerm || showImportantOnly) {
      const results = notifications.filter((notification) => {
        const matchesSearch =
          searchTerm === "" ||
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.content.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesImportant =
          !showImportantOnly || notification.important === true;

        return matchesSearch && matchesImportant;
      });
      setFilteredNotifications(results);
    } else {
      setFilteredNotifications(notifications);
    }
  }, [searchTerm, showImportantOnly, notifications]);

  const handleAddNotification = () => {
    if (!newNotification.title || !newNotification.content) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    const db = getDatabase();
    const notificationsRef = ref(db, "notifications");
    push(notificationsRef, {
      ...newNotification,
      createdAt: new Date().toISOString(),
    })
      .then(() => {
        Alert.alert("Thành công", "Đã thêm thông báo mới");
        setNewNotification({ title: "", content: "", important: false });
        setLoading(false);
        setShowAddForm(false);
      })
      .catch((error) => {
        Alert.alert("Lỗi", "Không thể thêm thông báo: " + error.message);
        setLoading(false);
      });
  };

  const handleDeleteNotification = (id) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa thông báo này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        onPress: () => {
          setLoading(true);
          const db = getDatabase();
          const notificationRef = ref(db, `notifications/${id}`);
          remove(notificationRef)
            .then(() => {
              Alert.alert("Thành công", "Đã xóa thông báo");
              setLoading(false);
            })
            .catch((error) => {
              Alert.alert("Lỗi", "Không thể xóa thông báo: " + error.message);
              setLoading(false);
            });
        },
      },
    ]);
  };

  const navigateToEditScreen = (notificationId) => {
    navigation.navigate("EditNotification", { notificationId });
  };

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {item.important && (
            <View style={styles.importantBadge}>
              <Text style={styles.importantText}>Quan trọng</Text>
            </View>
          )}
        </View>
        <View style={styles.notificationActions}>
          <TouchableOpacity
            onPress={() => navigateToEditScreen(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={22} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteNotification(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={22} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.notificationText}>{item.content}</Text>
      </View>

      <View style={styles.notificationFooter}>
        <Text style={styles.notificationDate}>
          <Ionicons name="time-outline" size={12} color="#999" />{" "}
          {new Date(item.createdAt).toLocaleString()}
        </Text>
        {item.updatedAt && (
          <Text style={styles.notificationUpdated}>
            <Ionicons name="refresh-outline" size={12} color="#2196F3" />{" "}
            {new Date(item.updatedAt).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản Lý Thông Báo</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm !== "" && (
            <TouchableOpacity
              onPress={() => setSearchTerm("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Chỉ thông báo quan trọng</Text>
          <Switch
            value={showImportantOnly}
            onValueChange={setShowImportantOnly}
            trackColor={{ false: "#e0e0e0", true: "#81c784" }}
            thumbColor={showImportantOnly ? "#4CAF50" : "#f5f5f5"}
          />
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.listHeaderContainer}>
          <Text style={styles.listTitle}>
            Danh sách thông báo{" "}
            {filteredNotifications.length > 0
              ? `(${filteredNotifications.length})`
              : ""}
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={toggleAddForm}>
            <Ionicons
              name={showAddForm ? "remove-circle" : "add-circle"}
              size={24}
              color="#2196F3"
            />
            <Text style={styles.addButtonText}>
              {showAddForm ? "Đóng" : "Thêm mới"}
            </Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Tiêu đề thông báo"
              value={newNotification.title}
              onChangeText={(text) =>
                setNewNotification({ ...newNotification, title: text })
              }
            />
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Nội dung thông báo"
              value={newNotification.content}
              onChangeText={(text) =>
                setNewNotification({ ...newNotification, content: text })
              }
              multiline
            />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Thông báo quan trọng</Text>
              <Switch
                value={newNotification.important}
                onValueChange={(value) =>
                  setNewNotification({ ...newNotification, important: value })
                }
                trackColor={{ false: "#e0e0e0", true: "#81c784" }}
                thumbColor={newNotification.important ? "#4CAF50" : "#f5f5f5"}
              />
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddNotification}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Thêm thông báo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {loading && filteredNotifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>
              {searchTerm || showImportantOnly
                ? "Không tìm thấy thông báo nào phù hợp"
                : "Chưa có thông báo nào"}
            </Text>
            {(searchTerm || showImportantOnly) && (
              <TouchableOpacity
                style={styles.resetFilterButton}
                onPress={() => {
                  setSearchTerm("");
                  setShowImportantOnly(false);
                }}
              >
                <Text style={styles.resetFilterText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2196F3",
    padding: 16,
    alignItems: "center",
    elevation: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  listHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    color: "#2196F3",
    marginLeft: 4,
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  contentInput: {
    height: 100,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  searchContainer: {
    backgroundColor: "white",
    padding: 12,
    marginBottom: 4,
    elevation: 2,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
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
    marginTop: 16,
    textAlign: "center",
  },
  resetFilterButton: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  resetFilterText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  notificationItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
    flex: 1,
  },
  importantBadge: {
    backgroundColor: "#FFC107",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  importantText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  contentContainer: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: "#999",
  },
  notificationUpdated: {
    fontSize: 12,
    color: "#2196F3",
    fontStyle: "italic",
  },
  notificationActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default NotificationListScreen;
