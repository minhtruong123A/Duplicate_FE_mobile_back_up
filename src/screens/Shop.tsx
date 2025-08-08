// src/screens/Shop.tsx

import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BoxShop from './BoxShop';
import ProductShop from './ProductShop';
import { ShopTopTabParamList } from '../types/types';

// Khởi tạo Top Tab Navigator với type đã định nghĩa
const TopTab = createMaterialTopTabNavigator<ShopTopTabParamList>();

export default function Shop() {
  return (
    <TopTab.Navigator
      screenOptions={{
        // VÔ HIỆU HÓA CHỨC NĂNG VUỐT ĐỂ CHUYỂN TAB
        swipeEnabled: false,

        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: {
          backgroundColor: '#000000',
          height: 2,
        },
        tabBarLabelStyle: {
          textTransform: 'none', // Bỏ viết hoa toàn bộ chữ
          fontSize: 16,
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
        }
      }}
    >
      <TopTab.Screen name="Mystery Box" component={BoxShop} />
      <TopTab.Screen name="Collection Store" component={ProductShop} />
    </TopTab.Navigator>
  );
}
