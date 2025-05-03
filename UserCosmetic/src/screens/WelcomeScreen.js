import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.image} />
      <Text style={styles.title}>Chào mừng bạn đến với Cosmetic App!</Text>

      {/* Nút Đăng nhập */}
      <TouchableOpacity
        style={styles.btn_login}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.btn_text}>Bắt đầu</Text>
      </TouchableOpacity>

      {/* Dòng chuyển hướng Đăng ký */}
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.register_text}>
          Chưa có tài khoản? <Text style={styles.register_link}>Đăng ký</Text>
        </Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  btn_login: {
    backgroundColor: "#FF6699",
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginBottom: 15,
  },
  btn_text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
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
