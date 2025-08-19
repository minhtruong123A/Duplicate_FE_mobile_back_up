import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// CẬP NHẬT: Import API và type thật
import { getOrderHistory } from '../services/api.order'; // Giả sử API order ở đây
import { OrderHistoryItem } from '../types/types';
import ApiImage from '../components/ApiImage'; // Dùng component ảnh chung

// BỎ: Không cần dữ liệu giả nữa
// import { fakeOrderData, Order } from '../data/orderData';

// CẬP NHẬT: Component OrderList giờ sẽ nhận dữ liệu đã được lọc sẵn
const OrderList = ({ data }: { data: OrderHistoryItem[] }) => {

    const renderItem = ({ item }: { item: OrderHistoryItem }) => {
        // Xử lý để hiển thị đúng tên và ảnh
        const name = item.type === 'Box' ? item.boxName : item.productName;
        // LƯU Ý: API không trả về ảnh cho Box, nên Box có thể sẽ không có ảnh.
        // Ta tạm dùng sellerUrlImage cho sản phẩm.
        const imageUrl = item.type === 'ProductBuy' || item.type === 'ProductSell' ? item.sellerUrlImage : null;
        const date = new Date(item.purchasedAt).toLocaleDateString('vi-VN');

        // LƯU Ý: API không có trường 'status'. Mặc định tất cả là 'Completed'.
        const status = 'Completed';
        const statusColor = '#28a745';

        return (
            <View style={styles.itemContainer}>
                <ApiImage urlPath={imageUrl} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{name || 'N/A'}</Text>
                    <Text style={styles.itemDate}>{date}</Text>
                    <Text style={styles.itemPrice}>
                        {/* Hiển thị dấu + hoặc - tùy theo loại giao dịch */}
                        {item.type === 'ProductSell' ? '+ ' : '- '}
                        {item.totalAmount.toLocaleString('vi-VN')} VND
                    </Text>
                </View>
                <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
            </View>
        );
    };

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.transactionCode}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>You have no orders in this category.</Text>}
        />
    );
};

const TopTab = createMaterialTopTabNavigator();

export default function OrderHistory() {
    // THÊM MỚI: State để quản lý dữ liệu, loading và error
    const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // THÊM MỚI: useEffect để fetch dữ liệu một lần duy nhất
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                // API trả về mảng data trực tiếp theo định nghĩa hàm
                const historyData = await getOrderHistory();
                if (Array.isArray(historyData)) {
                    setOrders(historyData);
                }
                setError(null);
            } catch (err: any) {
                setError(err.message || "Failed to fetch history.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // THÊM MỚI: Dùng useMemo để lọc dữ liệu hiệu quả
    const purchaseData = useMemo(
        () => orders.filter(order => order.type === 'Box' || order.type === 'ProductBuy'),
        [orders]
    );

    const salesData = useMemo(
        () => orders.filter(order => order.type === 'ProductSell'),
        [orders]
    );

    // Hiển thị màn hình loading nếu đang fetch
    if (loading) {
        return <SafeAreaView style={styles.centerContainer}><ActivityIndicator size="large" color="#d9534f" /></SafeAreaView>;
    }
    // Hiển thị lỗi nếu có
    if (error) {
        return <SafeAreaView style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <TopTab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#d9534f',
                    tabBarInactiveTintColor: 'gray',
                    tabBarIndicatorStyle: { backgroundColor: '#d9534f' },
                    tabBarLabelStyle: { fontFamily: 'Oxanium-Bold', textTransform: 'none', fontSize: 16 },
                }}
            >
                <TopTab.Screen name="BuyHistory" options={{ title: "Purchase History" }}>
                    {/* Truyền dữ liệu đã lọc vào component */}
                    {() => <OrderList data={purchaseData} />}
                </TopTab.Screen>
                <TopTab.Screen name="SellHistory" options={{ title: "Sales History" }}>
                    {() => <OrderList data={salesData} />}
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
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    itemImage: { width: 70, height: 70, borderRadius: 8, marginRight: 12, backgroundColor: '#e9ecef' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontFamily: 'Oxanium-SemiBold', color: '#333' },
    itemDate: { fontSize: 12, fontFamily: 'Oxanium-Regular', color: '#999', marginVertical: 4 },
    itemPrice: { fontSize: 14, fontFamily: 'Oxanium-Bold', color: '#333' },
    status: { fontFamily: 'Oxanium-Bold', fontSize: 12, alignSelf: 'flex-start' },
    emptyText: { textAlign: 'center', marginTop: 50, fontFamily: 'Oxanium-Regular', color: '#666' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontFamily: 'Oxanium-Regular' }
});