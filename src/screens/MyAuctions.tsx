import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// --- Types, APIs, Components ---
import { UserProfile, AppNavigationProp } from '../types/types'; // Import các type cần thiết
import { fetchMyAuctionList, GetJoinedHistoryAuction } from '../services/api.auction'; // Import cả 2 API
import { getOtherProfile } from '../services/api.user';
import ApiImage from '../components/ApiImage';
import FilterBar from '../components/FilterBar';

// --- Type Definitions ---
// Giữ nguyên các type này để component hiểu cấu trúc dữ liệu
type AuctionItem = {
    _id: string;
    title: string;
    descripition: string;
    start_time: string;
    end_time: string;
    seller_id: string;
    status: number; // 0: Pending, 1: Approved/Ongoing, -1: Denied
    productImageUrl?: string;
};

type AuctionWithSeller = AuctionItem & {
    seller: UserProfile | null;
};

// --- Helper Functions ---
const formatTimeLeft = (endTime: string) => {
    const timeLeft = Math.max(0, new Date(endTime).getTime() - new Date().getTime());
    if (timeLeft === 0) return "Ended";
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `Ends in: ${hours}h ${minutes}m`;
};

const getStatusInfo = (item: AuctionItem): { text: string, color: string } => {
    const now = new Date();
    const startTime = new Date(item.start_time);
    const endTime = new Date(item.end_time);

    switch (item.status) {
        case 0:
            return { text: `Pending (Starts ${startTime.toLocaleDateString()})`, color: '#ffc107' };
        case 1:
            if (now > endTime) return { text: 'Ended', color: '#6c757d' };
            if (now < startTime) return { text: `Starts in...`, color: '#17a2b8' };
            return { text: formatTimeLeft(item.end_time), color: '#28a745' };
        case -1:
            return { text: 'Denied', color: '#dc3545' };
        default:
            return { text: 'Unknown', color: '#6c757d' };
    }
};

// --- Main Component ---
export default function MyAuctions() {
    const navigation = useNavigation<AppNavigationProp>();

    // --- State Management ---
    const [auctions, setAuctions] = useState<AuctionWithSeller[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'Hosted' | 'My Bids'>('Hosted');

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Chọn API để gọi dựa trên filter đang hoạt động
            const apiCall = activeFilter === 'Hosted' ? fetchMyAuctionList() : GetJoinedHistoryAuction();
            const auctionRes = await apiCall;

            if (auctionRes.success && Array.isArray(auctionRes.data)) {
                const flatAuctions: AuctionItem[] = auctionRes.data.flat();

                // Lấy thông tin người bán cho mỗi phiên đấu giá
                const auctionsWithSellers = await Promise.all(
                    flatAuctions.map(async (auction) => {
                        try {
                            const profileRes = await getOtherProfile(auction.seller_id);
                            return { ...auction, seller: profileRes.status ? profileRes.data : null };
                        } catch {
                            return { ...auction, seller: null };
                        }
                    })
                );
                setAuctions(auctionsWithSellers);
            } else {
                throw new Error(auctionRes.error || 'Invalid auction data format');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch auctions');
        } finally {
            setLoading(false);
        }
    }, [activeFilter]); // Tải lại dữ liệu mỗi khi activeFilter thay đổi

    // Dùng useFocusEffect để đảm bảo dữ liệu luôn mới nhất khi quay lại tab
    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [fetchData])
    );
    // --- Render Logic ---
    const renderItem = ({ item }: { item: AuctionWithSeller }) => {
        const status = getStatusInfo(item);
        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => navigation.navigate('AuctionDetail', { auctionId: item._id })}
            >
                <ApiImage
                    urlPath={item.productImageUrl || item.seller?.profileImage}
                    style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.itemDescription} numberOfLines={1}>{item.descripition}</Text>
                    {item.seller && (
                        <Text style={styles.sellerName}>by {item.seller.username}</Text>
                    )}
                    <Text style={[styles.statusText, { color: status.color }]}>
                        {status.text}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#333" /></SafeAreaView>;
    }

    if (error) {
        return <SafeAreaView style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FilterBar
                filters={['Hosted', 'My Bids']}
                activeFilter={activeFilter}
                onSelectFilter={(filter) => setActiveFilter(filter as 'Hosted' | 'My Bids')}
            />
            <FlatList
                data={auctions}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text>No auctions found in this category.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    listContent: { padding: 16, flexGrow: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    itemImage: { width: 100, height: 100, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' },
    itemInfo: { flex: 1, justifyContent: 'space-around' },
    itemName: { fontFamily: 'Oxanium-Bold', fontSize: 16 },
    itemDescription: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 13,
        color: '#666',
        marginVertical: 4,
    },
    sellerName: { fontFamily: 'Oxanium-Regular', fontSize: 12, color: '#888' },
    statusText: { fontFamily: 'Oxanium-Bold', fontSize: 14, marginTop: 4 },
});