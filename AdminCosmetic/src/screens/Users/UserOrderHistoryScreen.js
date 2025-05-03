import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";

export default function UserOrderHistoryScreen({ route }) {
  const { userId } = route.params;
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const orderRef = ref(db, `orders/${userId}`);

    const unsubscribe = onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setOrders(orderList);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛍 Lịch sử mua hàng</Text>

      {orders.length === 0 ? (
        <Text style={styles.noOrders}>Không có đơn hàng nào.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Image
                source={{ uri: item.productImage }}
                style={styles.productImage}
              />
              <View>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.orderDate}>
                  📅 Ngày mua: {item.orderDate}
                </Text>
                <Text style={styles.orderStatus}>
                  🚀 Trạng thái: {item.status}
                </Text>
                <Text style={styles.orderTotal}>
                  💲 Tổng tiền: {item.totalPrice} VND
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noOrders: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  orderCard: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 14,
    color: "gray",
  },
  orderStatus: {
    fontSize: 14,
    color: "#3498db",
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e74c3c",
  },
});
