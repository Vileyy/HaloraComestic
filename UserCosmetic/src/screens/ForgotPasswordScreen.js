import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Toast from "react-native-toast-message";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const auth = getAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "⚠️ Vui lòng nhập email của bạn!",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show({
        type: "success",
        text1: "✅ Email đặt lại mật khẩu đã được gửi!",
        text2: "Vui lòng kiểm tra hộp thư của bạn.",
      });
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error) {
      let errorMessage = "❌ Không thể gửi email đặt lại mật khẩu!";
      if (error.code === "auth/invalid-email") {
        errorMessage = "⚠️ Email không hợp lệ!";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "⚠️ Không tìm thấy tài khoản với email này!";
      }
      Toast.show({ type: "error", text1: errorMessage });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Quên mật khẩu</Text>
        <Text style={styles.subtitle}>
          Nhập email của bạn để nhận link đặt lại mật khẩu
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, isFocused && styles.labelFocused]}>
            Email
          </Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <TouchableOpacity style={styles.btnReset} onPress={handleResetPassword}>
          <Text style={styles.btnText}>Gửi link đặt lại mật khẩu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={20} color="#FF6699" />
          <Text style={styles.backText}>Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "pink",
  },
  box: {
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    position: "absolute",
    left: 15,
    top: 15,
    fontSize: 16,
    color: "#aaa",
    backgroundColor: "transparent",
    zIndex: 1,
  },
  labelFocused: {
    top: -10,
    fontSize: 12,
    color: "#FF6699",
    backgroundColor: "white",
    paddingHorizontal: 5,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f9f9f9",
  },
  btnReset: {
    backgroundColor: "#FF6699",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  backText: {
    color: "#FF6699",
    marginLeft: 10,
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;
