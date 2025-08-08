// src/screens/TopUpPackages.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

const packages = [
    { id: '1', name: 'Gói Tiết Kiệm', amount: 50000 },
    { id: '2', name: 'Gói Tiêu Chuẩn', amount: 100000 },
    { id: '3', name: 'Gói Nâng Cao', amount: 200000 },
    { id: '4', name: 'Gói Cao Cấp', amount: 500000 },
    { id: '5', name: 'Gói Đại Gia', amount: 1000000 },
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
