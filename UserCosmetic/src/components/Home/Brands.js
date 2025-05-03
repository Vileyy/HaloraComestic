import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [listKey, setListKey] = useState("brandsList");

  useEffect(() => {
    const db = getDatabase();
    const brandsRef = ref(db, "brands");

    onValue(brandsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const brandsArray = Object.keys(data).map((key) => ({
          id: key,
          image: data[key].image, // URL hình ảnh từ Cloudinary
        }));

        setBrands(brandsArray);
        setListKey(`brandsList-${Date.now()}`);
      }
    });
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.brandBox}>
      <Image source={{ uri: item.image }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 📌 Tiêu đề Thương hiệu */}
      <View style={styles.header}>
        <Text style={styles.titleHeader}>🏷️ Thương Hiệu</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* 📌 Danh sách thương hiệu */}
      <View style={styles.brandsBackground}>
        <FlatList
          key={listKey}
          data={brands}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal={true} // 📌 Scroll ngang
          showsHorizontalScrollIndicator={false} // 📌 Ẩn thanh scroll ngang
          contentContainerStyle={styles.flatListContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  viewAll: {
    fontSize: 16,
    color: "black",
  },
  brandsBackground: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  flatListContent: {
    paddingRight: 15, // 📌 Khoảng cách bên phải để tránh bị dính sát mép
  },
  brandBox: {
    width: 160,
    height: 160,
    borderRadius: 12, // 📌 Bo tròn 4 góc
    overflow: "hidden",
    marginRight: 15, // 📌 Khoảng cách giữa các thương hiệu
    backgroundColor: "white", // 📌 Nền trắng để đổ bóng nổi bật
    shadowColor: "#000",
    shadowOpacity: 0.2, // 📌 Đổ bóng rõ hơn
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, // 📌 Bóng đổ xuống dưới
    elevation: 5, // 📌 Đổ bóng cho Android
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default Brands;
