// src/screens/ExchangeRequests.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { fakeExchangeRequestData, ExchangeRequest } from '../data/exchangeRequestData';

const ExchangeIcon = (props: any) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M16 3h5v5M4 20L21 3M21 16v5h-5M3 4l18 18" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function ExchangeRequests() {
    const [requests, setRequests] = useState(fakeExchangeRequestData);

    const handleResponse = (id: string, response: 'Accepted' | 'Rejected') => {
        setRequests(prev =>
            prev.map(req => req.id === id ? { ...req, status: response } : req)
        );
    };

    const renderItem = ({ item }: { item: ExchangeRequest }) => (
        <View style={styles.itemContainer}>
            <View style={styles.userInfo}>
                <Image source={{ uri: item.requesterAvatar }} style={styles.avatar} />
                <Text style={styles.requesterName}>{item.requesterName} muốn trao đổi:</Text>
            </View>
            <View style={styles.exchangeRow}>
                <View style={styles.productInfo}>
                    <Text style={styles.productLabel}>Vật phẩm của họ</Text>
                    <Image source={{ uri: item.offeredItemImageUrl }} style={styles.productImage} />
                    <Text style={styles.productName} numberOfLines={2}>{item.offeredItemName}</Text>
                </View>
                <ExchangeIcon />
                <View style={styles.productInfo}>
                    <Text style={styles.productLabel}>Vật phẩm của bạn</Text>
                    <Image source={{ uri: item.requestedItemImageUrl }} style={styles.productImage} />
                    <Text style={styles.productName} numberOfLines={2}>{item.requestedItemName}</Text>
                </View>
            </View>
            {item.status === 'Pending' ? (
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleResponse(item.id, 'Rejected')}>
                        <Text style={styles.rejectButtonText}>Từ chối</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleResponse(item.id, 'Accepted')}>
                        <Text style={styles.acceptButtonText}>Chấp nhận</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={[styles.statusText, { color: item.status === 'Accepted' ? '#28a745' : '#dc3545' }]}>
                    Đã {item.status === 'Accepted' ? 'chấp nhận' : 'từ chối'}
                </Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={requests}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    listContent: { padding: 16 },
    itemContainer: {
        backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
    requesterName: { fontFamily: 'Oxanium-SemiBold', fontSize: 16 },
    exchangeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    productInfo: { alignItems: 'center', width: '40%' },
    productLabel: { fontFamily: 'Oxanium-Regular', fontSize: 12, color: '#999', marginBottom: 4 },
    productImage: { width: 100, height: 140, borderRadius: 8, backgroundColor: '#eee' },
    productName: { fontFamily: 'Oxanium-Regular', marginTop: 4, textAlign: 'center' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    actionButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 8 },
    rejectButton: { backgroundColor: '#f0f2f5' },
    rejectButtonText: { fontFamily: 'Oxanium-Bold', color: '#dc3545' },
    acceptButton: { backgroundColor: '#28a745' },
    acceptButtonText: { fontFamily: 'Oxanium-Bold', color: '#fff' },
    statusText: { textAlign: 'center', fontFamily: 'Oxanium-Bold', fontSize: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
});
