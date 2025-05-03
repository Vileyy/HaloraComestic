import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import BottomTabNavigator from "./BottomTabNavigator";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ViewAllScreen from "../screens/ViewAllScreen/ViewAllScreen";

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen
        name="ProductDetailScreen"
        component={ProductDetailScreen}
      />
      <Stack.Screen name="ViewAllScreen" component={ViewAllScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
