import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { getAuth, updateProfile, updateEmail } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { uploadToCloudinary } from "../../utils/uploadImage";
import { useNavigation } from "@react-navigation/native";

const DEFAULT_AVATAR = require("../../assets/avatar_default.jpg");

const PRIMARY_COLOR = "#F08080";
const SECONDARY_COLOR = "#F08080";
const LIGHT_GRAY = "#f5f6fa";

const UserInfoScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getDatabase();
  const navigation = useNavigation();

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState(DEFAULT_AVATAR);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("Nam");
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [addressDetail, setAddressDetail] = useState("");
  const [currentStep, setCurrentStep] = useState("province"); 

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");

      const userRef = ref(db, `users/${user.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setGender(data.gender || "Nam");
          setPhotoURL(data.photoURL || DEFAULT_AVATAR);

          if (!user.displayName && data.displayName) {
            setDisplayName(data.displayName);
          }
        } else {
          set(userRef, {
            displayName: user.displayName || "",
            photoURL: DEFAULT_AVATAR,
            email: user.email || "",
            phone: "",
            address: "",
            gender: "Nam",
          });
          setPhotoURL(DEFAULT_AVATAR);
        }
      });
    }
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await fetch(
        "https://provinces.open-api.vn/api/?depth=1"
      );
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách tỉnh/thành phố");
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await response.json();
      setDistricts(data.districts);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách quận/huyện");
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = await response.json();
      setWards(data.wards);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách phường/xã");
    }
  };

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    fetchDistricts(province.code);
    setCurrentStep("district");
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setSelectedWard(null);
    fetchWards(district.code);
    setCurrentStep("ward");
  };

  const handleWardSelect = (ward) => {
    setSelectedWard(ward);
    setCurrentStep("detail");
  };

  const handleAddressComplete = () => {
    const fullAddress = `${addressDetail}, ${selectedWard.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;
    setAddress(fullAddress);
    setIsAddressModalVisible(false);
    setCurrentStep("province");
  };

  const renderAddressModal = () => (
    <Modal
      visible={isAddressModalVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn địa chỉ</Text>
            <TouchableOpacity onPress={() => setIsAddressModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {currentStep === "province" && (
            <FlatList
              data={provinces}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.addressItem}
                  onPress={() => handleProvinceSelect(item)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {currentStep === "district" && (
            <FlatList
              data={districts}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.addressItem}
                  onPress={() => handleDistrictSelect(item)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {currentStep === "ward" && (
            <FlatList
              data={wards}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.addressItem}
                  onPress={() => handleWardSelect(item)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {currentStep === "detail" && (
            <View style={styles.detailContainer}>
              <TextInput
                style={styles.detailInput}
                placeholder="Nhập số nhà, tên đường..."
                value={addressDetail}
                onChangeText={setAddressDetail}
              />
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleAddressComplete}
              >
                <Text style={styles.completeButtonText}>Lưu thông tin</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      const cloudinaryUrl = await uploadToCloudinary(localUri);
      if (cloudinaryUrl) {
        setPhotoURL(cloudinaryUrl);
      } else {
        Alert.alert("Lỗi", "Tải ảnh lên không thành công.");
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
      return;
    }

    try {
      await updateProfile(user, { displayName, photoURL });
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const currentData = snapshot.val() || {};

      await set(userRef, {
        ...currentData,
        displayName,
        photoURL,
        email,
        phone,
        address,
        gender,
      });

      Alert.alert("Thành công", "Cập nhật thông tin thành công!", [
        { text: "OK" },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
            <Text style={styles.headerSubtitle}>
              Cập nhật thông tin của bạn
            </Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  typeof photoURL === "string" ? { uri: photoURL } : photoURL
                }
                style={styles.avatar}
                defaultSource={DEFAULT_AVATAR}
              />
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <LinearGradient
                  colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
                  style={styles.cameraGradient}
                >
                  <Ionicons name="camera" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Tên hiển thị</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Nhập tên hiển thị"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Nhập email"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Nhập số điện thoại"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Địa chỉ</Text>
              <TouchableOpacity
                style={styles.addressInput}
                onPress={() => setIsAddressModalVisible(true)}
              >
                <Text
                  style={address ? styles.addressText : styles.placeholderText}
                >
                  {address || "Chọn địa chỉ"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.genderContainer}>
                {["Nam", "Nữ", "Khác"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderButton,
                      gender === option && styles.genderButtonSelected,
                    ]}
                    onPress={() => setGender(option)}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === option && styles.genderTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdateProfile}
          >
            <LinearGradient
              colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Lưu thay đổi</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      {renderAddressModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    marginTop: 20,
    marginBottom: 25,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#777",
  },
  profileSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: "30%",
  },
  cameraGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  inputSection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: LIGHT_GRAY,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: LIGHT_GRAY,
  },
  genderButtonSelected: {
    backgroundColor: PRIMARY_COLOR,
  },
  genderText: {
    fontSize: 16,
    color: "#333",
  },
  genderTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addressItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailContainer: {
    padding: 15,
  },
  detailInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  completeButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  addressInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: LIGHT_GRAY,
    justifyContent: "center",
  },
  addressText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
});

export default UserInfoScreen;
