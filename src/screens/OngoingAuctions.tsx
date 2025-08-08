// src/screens/OngoingAuctions.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fakeAuctionData, Auction } from '../data/auctionData';
import { RootStackNavigationProp } from '../types/types'; // Sẽ cập nhật type này sau

const OngoingAuctions = () => {
    const navigation = useNavigation<RootStackNavigationProp>();

    const renderItem = ({ item }: { item: Auction }) => {
        const timeLeft = Math.max(0, item.endTime.getTime() - new Date().getTime());
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => navigation.navigate('AuctionDetail', { auctionId: item.id })}
            >
                <Image source={{ uri: item.productImageUrl }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                    <Text style={styles.currentBidLabel}>Giá hiện tại:</Text>
                    <Text style={styles.currentBidAmount}>{item.currentBid.toLocaleString('vi-VN')} đ</Text>
                    <Text style={styles.timeLeft}>Còn lại: {hours}h {minutes}m</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={fakeAuctionData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    listContent: { padding: 16 },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    itemImage: { width: 100, height: 100, borderRadius: 8, marginRight: 12 },
    itemInfo: { flex: 1, justifyContent: 'space-between' },
    itemName: { fontFamily: 'Oxanium-Bold', fontSize: 16 },
    currentBidLabel: { fontFamily: 'Oxanium-Regular', color: '#666', fontSize: 12 },
    currentBidAmount: { fontFamily: 'Oxanium-Bold', color: '#28a745', fontSize: 18 },
    timeLeft: { fontFamily: 'Oxanium-SemiBold', color: '#d9534f', fontSize: 14 },
});

export default OngoingAuctions;
