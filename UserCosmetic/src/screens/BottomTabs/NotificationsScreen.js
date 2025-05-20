import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = fetchNotifications((data) => {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleNotificationPress = async (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);

    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setUnreadCount((prev) => prev - 1);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const renderNotificationItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.iconContainer,
            item.important ? styles.importantIcon : styles.regularIcon,
            !item.isRead && styles.unreadIcon,
          ]}
        >
          <Ionicons
            name={item.important ? "notifications" : "notifications-outline"}
            size={24}
            color="#fff"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300)} style={styles.contentContainer}>
          <Animated.View entering={FadeInDown.duration(300)} style={styles.titleContainer}>
            <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </Animated.View>

          <Text style={styles.content} numberOfLines={2}>
            {item.content}
          </Text>

          <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4081" />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.container}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <Animated.View entering={FadeInDown.duration(300)} style={styles.unreadCountContainer}>
          <Text style={styles.unreadCountText}>{unreadCount} chưa đọc</Text>
        </Animated.View>
      </Animated.View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có thông báo</Text>
          <Text style={styles.emptySubText}>
            Chúng tôi sẽ thông báo khi có tin mới
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ff4081"]}
              tintColor="#ff4081"
            />
          }
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            {selectedNotification && (
              <>
                <View style={styles.modalHeader}>
                  <Ionicons
                    name={
                      selectedNotification.important
                        ? "notifications"
                        : "notifications-outline"
                    }
                    size={32}
                    color={
                      selectedNotification.important ? "#ff4081" : "#90caf9"
                    }
                  />
                  <Text style={styles.modalTitle}>
                    {selectedNotification.title}
                  </Text>
                </View>

                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>
                    {selectedNotification.content}
                  </Text>
                  <Text style={styles.modalTime}>
                    <Ionicons name="time-outline" size={16} color="#666" />{" "}
                    {formatDate(selectedNotification.createdAt)}
                  </Text>
                </View>

                <Pressable
                  style={styles.modalButton}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={styles.modalButtonText}>Đóng</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  unreadCountContainer: {
    marginTop: 8,
  },
  unreadCountText: {
    fontSize: 14,
    color: "#ff4081",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: "#fff8fa",
    borderLeftWidth: 4,
    borderLeftColor: "#ff4081",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  unreadIcon: {
    borderWidth: 2,
    borderColor: "#ff4081",
  },
  regularIcon: {
    backgroundColor: "#90caf9",
  },
  importantIcon: {
    backgroundColor: "#ff4081",
  },
  contentContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    flex: 1,
  },
  unreadTitle: {
    color: "#333",
    fontWeight: "bold",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff4081",
    marginLeft: 8,
  },
  content: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  modalContent: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 15,
  },
  modalTime: {
    fontSize: 14,
    color: "#666",
    flexDirection: "row",
    alignItems: "center",
  },
  modalButton: {
    backgroundColor: "#ff4081",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NotificationsScreen;
