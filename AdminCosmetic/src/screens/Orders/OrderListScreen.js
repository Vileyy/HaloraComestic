import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchOrders = () => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');

    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const orderList = [];

      if (data) {
        Object.entries(data).forEach(([userId, userData]) => {
          if (userData.orders) {
            Object.entries(userData.orders).forEach(([orderId, orderData]) => {
              // Bổ sung thông tin khách hàng từ userData
              orderList.push({
                userId,
                orderId,
                ...orderData,
                // Thông tin người dùng
                customerName: userData.displayName || 'Khách hàng',
                email: userData.email || 'Không có email',
                phone: userData.phone || 'Không có SĐT',
                address: userData.address || 'Không có địa chỉ',
              });
            });
          }
        });
      }

      // Sắp xếp theo thời gian mới nhất
      orderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(orderList);
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusDetails = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          text: 'CHỜ XỬ LÝ',
          color: '#f5a623',
          backgroundColor: '#FFF5E6',
          icon: 'time-outline'
        };
      case 'processing':
        return {
          text: 'ĐANG XỬ LÝ',
          color: '#9C27B0',
          backgroundColor: '#F3E5F5',
          icon: 'sync-outline'
        };
      case 'shipping':
        return {
          text: 'ĐANG GIAO',
          color: '#4a90e2',
          backgroundColor: '#E3F2FD',
          icon: 'car-outline'
        };
      case 'completed':
      case 'delivered':
        return {
          text: 'HOÀN THÀNH',
          color: '#7ed321',
          backgroundColor: '#F1F8E9',
          icon: 'checkmark-circle-outline'
        };
      case 'cancelled':
        return {
          text: 'ĐÃ HỦY',
          color: '#e53935',
          backgroundColor: '#FFEBEE',
          icon: 'close-circle-outline'
        };
      default:
        return {
          text: (status || 'KHÔNG XÁC ĐỊNH').toUpperCase(),
          color: '#757575',
          backgroundColor: '#F5F5F5',
          icon: 'help-circle-outline'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có ngày';
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderItem = ({ item }) => {
    const firstProductName = item.items?.[0]?.name || 'Không rõ sản phẩm';
    const itemCount = item.items?.length || 0;
    const statusInfo = getStatusDetails(item.status);
    const productImage = item.items?.[0]?.image;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetailScreen', { order: item })}
        activeOpacity={0.7}
      >
        {/* Header Card */}
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderId}>Đơn hàng #{item.orderId ? item.orderId.slice(-6) : 'N/A'}</Text>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: statusInfo.backgroundColor }]}>
            <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Product Info */}
        <View style={styles.productContainer}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={styles.productImage} />
          ) : (
            <View style={styles.imageplaceholder}>
              <Ionicons name="image-outline" size={24} color="#bdbdbd" />
            </View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {truncateText(firstProductName, 50)}
            </Text>
            {itemCount > 1 && (
              <Text style={styles.moreItems}>+{itemCount - 1} sản phẩm khác</Text>
            )}
          </View>
        </View>

        {/* Customer Info Section */}
        <View style={styles.infoSection}>
          {/* Tên khách hàng */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={16} color="#555" />
            </View>
            <Text style={styles.infoLabel}>Khách:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {item.customerName || 'Khách hàng'}
            </Text>
          </View>
          
          {/* Email */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={16} color="#555" />
            </View>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {item.email || 'Không có email'}
            </Text>
          </View>
          
          {/* Số điện thoại */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="call-outline" size={16} color="#555" />
            </View>
            <Text style={styles.infoLabel}>SĐT:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {item.phone || 'Không có SĐT'}
            </Text>
          </View>
          
          {/* Địa chỉ */}
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={16} color="#555" />
            </View>
            <Text style={styles.infoLabel}>Địa chỉ:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {item.address || 'Không có địa chỉ'}
            </Text>
          </View>
        </View>

        {/* Footer with total price */}
        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalValue}>{item.total ? item.total.toLocaleString() : 0}đ</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
        <Text style={styles.orderCount}>{orders.length} đơn hàng</Text>
      </View>
      
      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4a90e2']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={60} color="#bdbdbd" />
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        }
      />
    </View>
  );
};

export default OrderListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 23,
    marginTop: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  orderCount: {
    fontSize: 18,
    marginTop: 30,
    color: 'red',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#757575',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  productContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  imageplaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  moreItems: {
    fontSize: 12,
    color: '#4a90e2',
    marginTop: 4,
  },
  infoSection: {
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 20,
    alignItems: 'center',
    marginRight: 4,
  },
  infoLabel: {
    width: 55,
    fontWeight: '600',
    fontSize: 13,
    color: '#757575',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e53935',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
});