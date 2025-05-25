import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.image} />
      <Text style={styles.title}>Chào mừng bạn đến với Cosmetic App!</Text>

      {/* Nút Đăng nhập */}
      <TouchableOpacity
        style={styles.btn_login}
        onPress={() => navigation.navigate("Login")}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={["#FF4B8B", "#FF6699"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.btnContent}>
            <Text style={styles.btn_text}>Bắt đầu</Text>
            <View style={styles.iconContainer}>
              <MaterialIcons name="arrow-forward" size={24} color="white" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Dòng chuyển hướng Đăng ký */}
      {/* <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.register_text}>
          Chưa có tài khoản? <Text style={styles.register_link}>Đăng ký</Text>
        </Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "pink",
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 5,
    resizeMode: "contain",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
    textAlign: "center",
  },
  btn_login: {
    width: "85%",
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#FF4B8B",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  btn_text: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  iconContainer: {
    marginLeft: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 6,
  },
  register_text: {
    fontSize: 16,
    color: "white",
  },
  register_link: {
    color: "#FF6699",
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
