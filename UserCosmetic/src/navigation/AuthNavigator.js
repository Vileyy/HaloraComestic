import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import ProductDetailScreen from "../components/Product/ProductDetailScreen";
import CartScreen from "../screens/Cart/CartScreen";
import SearchScreen from "../components/Search/SearchScreen";
import { CartProvider } from "../context/CartContext";
import ExploreScreen from "../screens/BottomTabs/ExploreScreen";
import UserInfoScreen from "../screens/Profile/UserInfoScreen";
import ChangePasswordScreen from "../screens/Profile/ChangePasswordScreen";
import FavoriteProductsScreen from "../screens/Profile/FavoriteProductsScreen";
import CheckoutScreen from "../screens/Checkout/CheckoutScreen";
import OrderSuccessScreen from "../screens/Order/OrderSuccessScreen";
import OrderStatusScreen from "../screens/Order/OrderStatusScreen";
import OrderTrackingScreen from "../screens/Order/OrderTrackingScreen";
import OrderDetailScreen from "../screens/Order/OrderDetailScreen";
import OrderHistoryScreen from "../screens/Profile/OrderHistoryScreen";
import ProfileScreen from "../screens/BottomTabs/ProfileScreen";
import ViewAllScreen from "../screens/ViewAllScreen/ViewAllScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={BottomTabNavigator} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
          <Stack.Screen
            name="ProductDetailScreen"
            component={ProductDetailScreen}
          />

          {/* View All */}
          <Stack.Screen name="ViewAllScreen" component={ViewAllScreen} />

          {/* Cart */}
          <Stack.Screen name="Cart" component={CartScreen} />

          {/* Profile */}
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="UserInfo" component={UserInfoScreen} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
          />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen
            name="FavoriteProductsScreen"
            component={FavoriteProductsScreen}
          />

          {/* Order Screen */}
          <Stack.Screen
            name="OrderSuccessScreen"
            component={OrderSuccessScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
          <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
          <Stack.Screen
            name="OrderHistory"
            component={OrderHistoryScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
};

export default AppNavigator;
