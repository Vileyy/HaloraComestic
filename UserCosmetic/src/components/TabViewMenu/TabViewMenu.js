import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

const { width, height } = Dimensions.get("window");
const MENU_WIDTH = width * 0.75;

const TabViewMenu = ({ isVisible, onClose }) => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(isVisible);
  
  console.log("Menu visibility:", isVisible); 

  // Lấy thông tin người dùng từ Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          const db = getDatabase();
          const userRef = ref(db, `users/${auth.currentUser.uid}`);

          onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
              setUserData(snapshot.val());
            }
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchUserData();
    }
  }, [isVisible]);

  // Hiệu ứng slide & fade
  useEffect(() => {
    console.log("Animation triggered, isVisible:", isVisible); 
    
    if (isVisible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false); // chỉ tắt render khi animation xong
      });
    }
  }, [isVisible]);

  if (!shouldRender) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          onPress: async () => {
            try {
              const auth = getAuth();
              await auth.signOut();
              onClose();
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Logout error:", error);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };
  
  const handleMenuItemPress = (item) => {
    if (item.type === "logout") {
      handleLogout();
    } else {
      onClose();
      navigation.navigate(item.navigate);
    }
  };

  // Danh sách các mục menu 
  const menuItems = [
    { icon: "home-outline", label: "Trang chủ", navigate: "Home" },
    { icon: "person-outline", label: "Tài khoản", navigate: "UserInfo" },
    { icon: "cart-outline", label: "Giỏ hàng", navigate: "Cart" },
    { icon: "time-outline", label: "Lịch sử đơn hàng", navigate: "OrderHistory" },
    // { icon: "log-out-outline", label: "Đăng xuất", type: "logout" },
  ];
  
  // Render một item menu
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item)}
      activeOpacity={0.7}
    >
      <Ionicons name={item.icon} size={24} color="#333" />
      <Text style={styles.menuItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Slide menu */}
      <Animated.View
        style={[
          styles.menu,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.menuHeader}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <View style={styles.userInfo}>
              {userData?.photoURL ? (
                <Image
                  source={{ uri: userData.photoURL }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {userData?.displayName
                      ? userData.displayName.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                </View>
              )}
              <View style={styles.userTextContainer}>
                <Text style={styles.userName}>
                  {userData?.displayName || "Người dùng"}
                </Text>
                <Text style={styles.userEmail}>
                  {userData?.email || ""}
                </Text>
              </View>
            </View>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Menu items - Using FlatList instead of ScrollView */}
        <View style={styles.menuContent}>
          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item, index) => `menu-item-${index}`}
            style={styles.menuItemList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Footer */}
        <View style={styles.menuFooter}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: height,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "column",
  },
  menuHeader: {
    backgroundColor: "#F08080",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F08080",
  },
  userTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  userEmail: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.8,
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
    width: "100%",
  },
  menuItemList: {
    flex: 1,
    width: "100%",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
    fontWeight: "500",
  },
  menuFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    width: "100%",
    marginBottom: 100,
  },
  logoutButton: {
    backgroundColor: "#F08080",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
  },
  logoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default TabViewMenu;