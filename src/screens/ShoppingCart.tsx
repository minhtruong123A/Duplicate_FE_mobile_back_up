// src/screens/ShoppingCart.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';

// SỬA LỖI: Đổi tên type cho đúng
import { ShoppingCartTopTabParamList, CartData } from '../types/types';
import FavoriteBoxes from './FavoriteBoxes';
import FavoriteProducts from './FavoriteProducts';
import { viewCart } from '../services/api.cart'; // Giả sử API cart ở đây


// SỬA LỖI: Sử dụng đúng tên type
const TopTab = createMaterialTopTabNavigator<ShoppingCartTopTabParamList>();


// Đổi tên component từ Cart -> ShoppingCart cho nhất quán
export default function ShoppingCart() {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dùng useCallback và useFocusEffect để tải lại giỏ hàng mỗi khi vào màn hình
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await viewCart();
      if (response.status && response.data) {
        setCartData(response.data);
      } else {
        throw new Error("Failed to load cart data.");
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCart(); // Gọi hàm async bên trong một hàm sync
    }, [loadCart])
  );

  if (loading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#d9534f" /></SafeAreaView>;
  }

  if (error) {
    return <SafeAreaView style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></SafeAreaView>;
  }


  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Dòng mô tả ngay dưới header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Buy now or save for later</Text>
      </View>
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
        <TopTab.Screen name="Favorite Boxes" options={{ title: "Mystery Boxes" }}>
          {() => <FavoriteBoxes boxes={cartData?.boxes || []} refreshCart={loadCart} />}
        </TopTab.Screen>
        <TopTab.Screen name="Favorite Products" options={{ title: "Store Items" }}>
          {() => <FavoriteProducts products={cartData?.products || []} refreshCart={loadCart} />}
        </TopTab.Screen>
      </TopTab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerText: { fontSize: 12, color: 'gray', fontFamily: 'Oxanium-Regular', textTransform: 'none' }
});
