import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

// Dữ liệu mới dựa trên hình ảnh, bỏ shortLabel không cần thiết cho giao diện cũ
const packages = [
    { id: '1', name: 'Quick Charge', amount: 25000 },
    { id: '2', name: 'Power Pack', amount: 59000 },
    { id: '3', name: 'Elite Scroll', amount: 79000 },
    { id: '4', name: 'Mythic Cache', amount: 129000 },
    { id: '5', name: 'Shogun\'s Trove', amount: 379000 },
    { id: '6', name: 'Artisan Ink', amount: 779000 },
    { id: '7', name: 'Dragon\'s Hoard', amount: 1299000 },
    { id: '8', name: 'Cosmic Bundle', amount: 2499000 },
];

export default function TopUpPackages() {

    const renderItem = ({ item }: { item: typeof packages[0] }) => (
        <TouchableOpacity style={styles.packageItem}>
            <Text style={styles.packageName}>{item.name}</Text>
            <Text style={styles.packageAmount}>{item.amount.toLocaleString('vi-VN')} đ</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={packages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    listContent: {
        padding: 16,
    },
    packageItem: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    packageName: {
        fontSize: 18,
        fontFamily: 'Oxanium-SemiBold',
    },
    packageAmount: {
        fontSize: 18,
        fontFamily: 'Oxanium-Bold',
        color: '#d9534f',
    },
});
