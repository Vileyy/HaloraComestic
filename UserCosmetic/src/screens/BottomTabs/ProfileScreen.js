import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = ref(db, `users/${currentUser.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserInfo(snapshot.val());
        }
      });

      return () => unsubscribe(); // cleanup listener
    }
  }, []);

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
          onPress: () => {
            signOut(auth)
              .then(() => {
                Alert.alert("Đăng xuất thành công!");
                navigation.replace("Login");
              })
              .catch((error) => {
                Alert.alert("Lỗi khi đăng xuất", error.message);
              });
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => navigation.navigate("UserInfo")}
        activeOpacity={0.7}
      >
        <Image
          source={
            userInfo?.photoURL &&
            userInfo.photoURL !== "https://via.placeholder.com/100"
              ? { uri: userInfo.photoURL }
              : require("../../assets/avatar_default.jpg")
          }
          style={styles.avatar}
        />
        <View>
          <Text style={styles.userName}>
            {userInfo?.displayName || "Người dùng"}
          </Text>
          <Text style={styles.userEmail}>
            {auth.currentUser?.email || "Không rõ email"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Các mục trong Profile */}
      <View style={styles.section}>
        <ProfileItem
          icon="person-circle-outline"
          label="Thông tin cá nhân"
          onPress={() => navigation.navigate("UserInfo")}
        />
        <ProfileItem
          icon="lock-closed-outline"
          label="Đổi mật khẩu"
          onPress={() => navigation.navigate("ChangePassword")}
        />
        <ProfileItem
          icon="cart-outline"
          label="Lịch sử mua hàng"
          onPress={() => navigation.navigate("OrderHistory")}
        />
        <ProfileItem
          icon="document-text-outline"
          label="Tình trạng đơn hàng"
          onPress={() => navigation.navigate("OrderStatus")}
        />
        <ProfileItem
          icon="heart-outline"
          label="Sản phẩm yêu thích"
          onPress={() => navigation.navigate("FavoriteProductsScreen")}
        />
        <ProfileItem
          icon="log-out-outline"
          label="Đăng xuất"
          color="red"
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
};

// Component mục Profile
const ProfileItem = ({ icon, label, onPress, color = "#333" }) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.itemText, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color="#999" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    marginTop: 50,
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "gray",
  },
  section: {
    backgroundColor: "white",
    marginTop: 10,
    borderRadius: 15,
    marginHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ProfileScreen;
