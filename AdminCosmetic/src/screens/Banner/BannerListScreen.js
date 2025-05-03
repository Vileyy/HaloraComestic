import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getBannersFromFirebase,
  deleteBannerFromFirebase,
  toggleBannerStatus,
} from "../../services/firebaseServices";

const BannerListScreen = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchBanners();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchBanners();
    }, [])
  );

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getBannersFromFirebase();
      setBanners(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách banner.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xoá banner này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBannerFromFirebase(id);
            fetchBanners();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xoá banner.");
          }
        },
      },
    ]);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleBannerStatus(id, !currentStatus);
      fetchBanners();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thay đổi trạng thái banner.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.image} 
        resizeMode="cover"
      />
      <View style={styles.info}>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.isActive ? '#E8F5E9' : '#FFEBEE' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: item.isActive ? '#2E7D32' : '#C62828' }
            ]}>
              {item.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.link} numberOfLines={1}>{item.linkUrl}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate("EditBannerScreen", { banner: item })}
          >
            <Text style={styles.editButtonText}>Sửa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton]}
            onPress={() => handleToggleStatus(item.id, item.isActive)}
          >
            <Text style={styles.toggleButtonText}>
              {item.isActive ? 'Ẩn' : 'Hiện'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.deleteButtonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#ff4081" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Banner</Text>
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E88E5" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : banners.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có banner nào</Text>
          </View>
        ) : (
          <FlatList
            data={banners}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate("AddBannerScreen")}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#ff4081",
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#757575",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  image: {
    width: 110,
    height: 110,
    backgroundColor: "#E0E0E0",
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  link: {
    fontSize: 14,
    color: "#616161",
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
    elevation: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 64,
  },
  editButton: {
    backgroundColor: "#E3F2FD",
  },
  editButtonText: {
    color: "#1E88E5",
    fontWeight: "600",
    fontSize: 14,
  },
  toggleButton: {
    backgroundColor: "#E8F5E9",
  },
  toggleButtonText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
  },
  deleteButtonText: {
    color: "#C62828",
    fontWeight: "600",
    fontSize: 14,
  },
  fabButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff4081",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#1E88E5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabIcon: {
    fontSize: 30,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});

export default BannerListScreen;