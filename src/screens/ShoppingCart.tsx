// src/screens/ShoppingCart.tsx

import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// SỬA LỖI: Đổi tên type cho đúng
import { ShoppingCartTopTabParamList } from '../types/types';
import FavoriteBoxes from './FavoriteBoxes';
import FavoriteProducts from './FavoriteProducts';

// SỬA LỖI: Sử dụng đúng tên type
const TopTab = createMaterialTopTabNavigator<ShoppingCartTopTabParamList>();

// Đổi tên component từ Cart -> ShoppingCart cho nhất quán
export default function ShoppingCart() {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: {
          backgroundColor: '#d9534f', // Màu đỏ cho phù hợp
          height: 2,
        },
        tabBarLabelStyle: {
          textTransform: 'none',
          fontSize: 16,
          fontFamily: 'Oxanium-Bold',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
        }
      }}
    >
      <TopTab.Screen name="Favorite Boxes" component={FavoriteBoxes} options={{ title: "Mystery Boxes" }} />
      <TopTab.Screen name="Favorite Products" component={FavoriteProducts} options={{ title: "Store Items" }} />
    </TopTab.Navigator>
  );
}
