import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { registerUser } from "../services/authService";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons"; 

// Component cho input với nhãn nổi
const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  isPassword = false,
  showPassword,
  setShowPassword,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = new Animated.Value(value ? 1 : 0);

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedIsFocused]);

  const labelStyle = {
    position: "absolute",
    left: 15,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [15, -10],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ["#aaa", "#FF6699"],
    }),
    backgroundColor: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "white"],
    }),
    paddingHorizontal: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 5],
    }),
    zIndex: 1,
  };

  return (
    <View style={styles.inputContainer}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        style={[
          styles.input,
          { paddingTop: 12 },
          isPassword && { paddingRight: 45 },
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={isPassword ? !showPassword : secureTextEntry}
        keyboardType={keyboardType}
        blurOnSubmit
      />
      {isPassword && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập đầy đủ thông tin!",
      });
      return;
    }
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mật khẩu phải từ 6 ký tự trở lên!",
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mật khẩu không khớp!",
      });
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password, name);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đăng ký thành công!",
      });
      setTimeout(() => navigation.navigate("Login"), 1500);
    } catch (error) {
      Toast.show({ type: "error", text1: "Lỗi", text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../assets/logo.png")} style={styles.image} />

      {/* Khung chứa form */}
      <View style={styles.box}>
        <Text style={styles.title}>Đăng ký tài khoản</Text>

        <FloatingLabelInput
          label="Họ và tên"
          value={name}
          onChangeText={setName}
        />

        <FloatingLabelInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <FloatingLabelInput
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          isPassword={true}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          autoCapitalize="none"
          autoComplete="off"
        />

        <FloatingLabelInput
          label="Nhập lại mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword={true}
          showPassword={showConfirmPassword}
          setShowPassword={setShowConfirmPassword}
          autoCapitalize="none"
          autoComplete="off"
        />

        {/* Nút đăng ký */}
        <TouchableOpacity
          style={styles.btn_register}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btn_text}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        {/* Chuyển sang màn hình đăng nhập */}
        <Text style={styles.text}>
          Đã có tài khoản?{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Login")}
          >
            Đăng nhập ngay
          </Text>
        </Text>
      </View>

      {/* Hiển thị Toast */}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "pink",
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 350,
  },
  box: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "100%",
    height: "55%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "absolute",
    bottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  inputContainer: {
    width: "100%",
    height: 50,
    marginBottom: 15,
    position: "relative",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 1,
  },
  btn_register: {
    backgroundColor: "#FF6699",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btn_text: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    textAlign: "center",
    marginTop: 15,
    color: "black",
  },
  link: {
    color: "#FF6699",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
