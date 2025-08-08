// src/screens/OrderHistory.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { fakeOrderData, Order } from '../data/orderData';

const getStatusColor = (status: Order['status']) => {
    if (status === 'Completed') return '#28a745';
    if (status === 'Cancelled') return '#dc3545';
    return '#ffc107';
};

const OrderList = ({ type }: { type: 'buy' | 'sell' }) => {
    const data = fakeOrderData.filter(order => order.type === type);

    const renderItem = ({ item }: { item: Order }) => (
        <View style={styles.itemContainer}>
            <Image source={{ uri: item.productImageUrl }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.itemDate}>{item.date}</Text>
                <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
            </View>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
    );

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>You have no orders.</Text>}
        />
    );
};

const TopTab = createMaterialTopTabNavigator();

export default function OrderHistory() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <TopTab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#d9534f',
                    tabBarInactiveTintColor: 'gray',
                    tabBarIndicatorStyle: { backgroundColor: '#d9534f' },
                    tabBarLabelStyle: { fontFamily: 'Oxanium-Bold', textTransform: 'none' },
                }}
            >
                <TopTab.Screen name="BuyHistory" options={{ title: "Purchase History" }}>
                    {() => <OrderList type="buy" />}
                </TopTab.Screen>
                <TopTab.Screen name="SellHistory" options={{ title: "Sales History" }}>
                    {() => <OrderList type="sell" />}
                </TopTab.Screen>
            </TopTab.Navigator>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    listContent: { padding: 16 },
    itemContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 12, padding: 12, marginBottom: 16,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    itemImage: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontFamily: 'Oxanium-SemiBold' },
    itemDate: { fontSize: 12, fontFamily: 'Oxanium-Regular', color: '#999', marginVertical: 4 },
    itemPrice: { fontSize: 14, fontFamily: 'Oxanium-Bold', color: '#333' },
    status: { fontFamily: 'Oxanium-Bold', fontSize: 12 },
    emptyText: { textAlign: 'center', marginTop: 50, fontFamily: 'Oxanium-Regular' }
});
