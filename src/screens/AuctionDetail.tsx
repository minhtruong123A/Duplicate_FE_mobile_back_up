// src/screens/AuctionDetail.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { fakeAuctionData, Bid } from '../data/auctionData';
import { RootStackScreenProps } from '../types/types';

export default function AuctionDetail({ route }: RootStackScreenProps<'AuctionDetail'>) {
    const { auctionId } = route.params;
    const auction = fakeAuctionData.find(a => a.id === auctionId);
    const [bidAmount, setBidAmount] = useState('');

    if (!auction) {
        return <SafeAreaView><Text>Không tìm thấy phiên đấu giá.</Text></SafeAreaView>;
    }

    const handlePlaceBid = () => {
        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount <= auction.currentBid) {
            Alert.alert("Giá không hợp lệ", `Giá của bạn phải cao hơn ${auction.currentBid.toLocaleString('vi-VN')} đ.`);
            return;
        }
        Alert.alert("Thành công", `Bạn đã đặt giá thành công ${amount.toLocaleString('vi-VN')} đ.`);
        setBidAmount('');
    };

    const renderBidHistoryItem = ({ item }: { item: Bid }) => (
        <View style={styles.historyItem}>
            <Text style={styles.bidderName}>{item.bidderName}</Text>
            <Text style={styles.bidAmount}>{item.amount.toLocaleString('vi-VN')} đ</Text>
            <Text style={styles.bidTimestamp}>{item.timestamp}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Image source={{ uri: auction.productImageUrl }} style={styles.productImage} />
                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{auction.productName}</Text>
                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>Giá khởi điểm:</Text>
                        <Text style={styles.priceValue}>{auction.startingPrice.toLocaleString('vi-VN')} đ</Text>
                    </View>
                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>Giá cao nhất:</Text>
                        <Text style={[styles.priceValue, { color: '#28a745' }]}>{auction.currentBid.toLocaleString('vi-VN')} đ</Text>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Lịch sử đấu giá ({auction.bidCount} lượt)</Text>
                    <FlatList
                        data={auction.biddingHistory}
                        renderItem={renderBidHistoryItem}
                        keyExtractor={item => item.id}
                        scrollEnabled={false} // Vô hiệu hóa cuộn của FlatList
                    />
                </View>
            </ScrollView>
            <View style={styles.bidInputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={`Giá > ${auction.currentBid.toLocaleString('vi-VN')} đ`}
                    keyboardType="numeric"
                    value={bidAmount}
                    onChangeText={setBidAmount}
                />
                <TouchableOpacity style={styles.bidButton} onPress={handlePlaceBid}>
                    <Text style={styles.bidButtonText}>Đấu giá</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    productImage: { width: '100%', height: 300, resizeMode: 'contain', backgroundColor: '#f0f2f5' },
    infoContainer: { padding: 16 },
    productName: { fontSize: 24, fontFamily: 'Oxanium-Bold', marginBottom: 16 },
    priceInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    priceLabel: { fontSize: 16, fontFamily: 'Oxanium-Regular', color: '#666' },
    priceValue: { fontSize: 16, fontFamily: 'Oxanium-Bold' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
    sectionTitle: { fontSize: 18, fontFamily: 'Oxanium-Bold', marginBottom: 12 },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    bidderName: { flex: 1, fontFamily: 'Oxanium-SemiBold' },
    bidAmount: { flex: 1, fontFamily: 'Oxanium-Regular', textAlign: 'center' },
    bidTimestamp: { flex: 1, fontFamily: 'Oxanium-Regular', color: '#999', textAlign: 'right' },
    bidInputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginRight: 8, fontFamily: 'Oxanium-Regular' },
    bidButton: { backgroundColor: '#d9534f', padding: 12, borderRadius: 8, justifyContent: 'center' },
    bidButtonText: { color: '#fff', fontFamily: 'Oxanium-Bold', fontSize: 16 },
});
