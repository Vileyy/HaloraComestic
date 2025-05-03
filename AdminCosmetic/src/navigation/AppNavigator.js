import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import ProductListScreen from "../screens/Products/ProductListScreen";
import AddProductScreen from "../screens/Products/AddProductScreen";
import EditProductScreen from "../screens/Products/EditProductScreen";
import UserListScreen from "../screens/Users/UserListScreen";
import UserDetailScreen from "../screens/Users/UserDetailScreen";
import UserEditScreen from "../screens/Users/UserEditScreen";
import CategoryListScreen from "../screens/Categories/CategoryListScreen";
import AddCategoryScreen from "../screens/Categories/AddCategoryScreen";
import EditCategoryScreen from "../screens/Categories/EditCategoryScreen";
import BrandListScreen from "../screens/BrandManagement/BrandListScreen";
import AddBrandScreen from "../screens/BrandManagement/AddBrandScreen";
import EditBrandScreen from "../screens/BrandManagement/EditBrandScreen";
import OrderListScreen from "../screens/Orders/OrderListScreen";
import OrderDetailScreen from "../screens/Orders/OrderDetailScreen";
import RevenueScreen from "../screens/Revenue/RevenueScreen";
import BannerListScreen from "../screens/Banner/BannerListScreen";
import AddBannerScreen from "../screens/Banner/AddBannerScreen";
import EditBannerScreen from "../screens/Banner/EditBannerScreen";
import NotificationListScreen from "../screens/Notification/NotificationListScreen";
import EditNotificationScreen from "../screens/Notification/EditNotificationScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Dashboard Admin" }}
      />
      {/* Quản lý sản phẩm */}
      <Stack.Screen
        name="ProductListScreen"
        component={ProductListScreen}
        options={{ title: "Quan ly san pham" }}
      />
      <Stack.Screen
        name="AddProductScreen"
        component={AddProductScreen}
        options={{ title: "Thêm sản phẩm" }}
      />
      <Stack.Screen name="EditProductScreen" component={EditProductScreen} />

      {/* Quản lý người dùng */}
      <Stack.Screen name="UserListScreen" component={UserListScreen} />
      <Stack.Screen name="UserDetailScreen" component={UserDetailScreen} />
      <Stack.Screen name="UserEditScreen" component={UserEditScreen} />

      {/* Quản lý Danh mục */}
      <Stack.Screen name="CategoryListScreen" component={CategoryListScreen} />
      <Stack.Screen name="AddCategoryScreen" component={AddCategoryScreen} />
      <Stack.Screen name="EditCategoryScreen" component={EditCategoryScreen} />

      {/* Quản lý thương hiệu */}
      <Stack.Screen name="BrandListScreen" component={BrandListScreen} />
      <Stack.Screen name="AddBrandScreen" component={AddBrandScreen} />
      <Stack.Screen name="EditBrandScreen" component={EditBrandScreen} />

      {/* Quản lý đơn hàng */}
      <Stack.Screen name="OrderListScreen" component={OrderListScreen} />
      <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />

      {/* Quản lý doanh thu */}
      <Stack.Screen name="RevenueScreen" component={RevenueScreen} />

      {/* Quản lý Banner */}
      <Stack.Screen name="BannerListScreen" component={BannerListScreen} />
      <Stack.Screen name="AddBannerScreen" component={AddBannerScreen} />
      <Stack.Screen name="EditBannerScreen" component={EditBannerScreen} />

      {/* Quản lý thông báo */}
      <Stack.Screen
        name="NotificationListScreen"
        component={NotificationListScreen}
      />
      <Stack.Screen
        name="EditNotification"
        component={EditNotificationScreen}
        options={{ title: "Chỉnh sửa thông báo" }}
      />
    </Stack.Navigator>
  );
}
