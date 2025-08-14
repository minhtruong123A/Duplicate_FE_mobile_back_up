// src/screens/OngoingAuctions.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Button } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fakeAuctionData, Auction } from '../data/auctionData';
import { RootStackNavigationProp, UserProfile } from '../types/types'; // Sẽ cập nhật type này sau
import { fetchAuctionList } from '../services/api.auction';
import ApiImage from '../components/ApiImage';
import { getOtherProfile } from '../services/api.user'; // Đường dẫn đúng tới api getOtherProfile
import FilterBar from '../components/FilterBar'; // import FilterBar bạn tạo


type AuctionItem = {
    _id: string;
    title: string;
    descripition: string;
    start_time: string;
    end_time: string;
    seller_id: string;
    status: number;
    productImageUrl?: string; // Nếu API có trường này
};

type AuctionWithSeller = AuctionItem & {
    seller: UserProfile | null;
};

export default function OngoingAuctions() {
    const navigation = useNavigation<RootStackNavigationProp>();
    const [filter, setFilter] = useState<'started' | 'waiting'>('started');
    const [auctions, setAuctions] = useState<AuctionWithSeller[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // const loadAuctions = async () => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const data = await fetchAuctionList(filter);
    //         setAuctionList(data);
    //     } catch (err) {
    //         setError('Failed to load auctions');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     loadAuctions();
    // }, [filter]);

    // Hàm format thời gian còn lại
    const formatTimeLeft = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const auctionRes = await fetchAuctionList(filter);
            if (auctionRes.success && Array.isArray(auctionRes.data)) {
                // Gọi thêm profile người bán cho từng auction
                const flatAuctions: AuctionItem[] = auctionRes.data.flat();

                const auctionsWithSeller = await Promise.all(
                    flatAuctions.map(async (auction: AuctionItem) => {
                        try {
                            const profileRes = await getOtherProfile(auction.seller_id);
                            return {
                                ...auction,
                                seller: profileRes.status ? profileRes.data : null,
                            };
                        } catch {
                            return {
                                ...auction,
                                seller: null,
                            };
                        }
                    })
                );
                setAuctions(auctionsWithSeller);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch auctions');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [fetchData]) // hoặc [filter] nếu bạn gọi fetchData inline
    );

    // useEffect(() => {
    //     fetchData();
    // }, [fetchData]);

    const renderItem = ({ item }: { item: AuctionWithSeller }) => {
        const now = new Date();
        const startTime = new Date(item.start_time);
        const endTime = new Date(item.end_time);

        let timeDisplay = '';
        if (now < startTime) {
            const timeLeft = startTime.getTime() - now.getTime();
            timeDisplay = `Starts in: ${formatTimeLeft(timeLeft)}`;
        } else if (now >= startTime && now <= endTime) {
            const timeLeft = endTime.getTime() - now.getTime();
            timeDisplay = `Ongoing - Ends in: ${formatTimeLeft(timeLeft)}`;
        } else {
            timeDisplay = `Ended on: ${endTime.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })}`;
        }

        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => navigation.navigate('AuctionDetail', { auctionId: item._id })}
            >
                <ApiImage
                    urlPath={item.productImageUrl || item.seller?.profileImage || 'https://via.placeholder.com/100?text=No+Image'}
                    style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item.title}
                    </Text>

                    <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.descripition}
                    </Text>

                    {item.seller && (
                        <Text style={styles.sellerName}>by {item.seller.username}</Text>
                    )}

                    <Text style={styles.timeLeft}>{timeDisplay}</Text>

                    <Text style={styles.statusText}>
                        {item.status === 1
                            ? 'Approved'
                            : item.status === 0
                                ? 'Pending'
                                : 'Denied'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const filters = ['started', 'waiting'] as const;
    type FilterKey = typeof filters[number];

    const labelMap = {
        started: 'Live',
        waiting: 'Starting Soon',
    };

    // đảo ngược map để dễ lookup khi người dùng chọn label
    const keyMap = Object.fromEntries(
        Object.entries(labelMap).map(([k, v]) => [v, k])
    ) as Record<string, FilterKey>; // chuyển ngược label -> key
    const displayFilters = filters.map(k => labelMap[k] ?? k); // ['On Going','Starting Soon']
    const activeFilterLabel = labelMap[filter];

    return (
        <SafeAreaView style={styles.container}>
            <FilterBar
                filters={displayFilters}
                activeFilter={activeFilterLabel}
                onSelectFilter={(selected) => {
                    const key = keyMap[selected] ?? (selected as FilterKey);
                    setFilter(key);
                }}
            />

            {loading && <ActivityIndicator size="large" color="#333" />}
            {error && (
                <Text style={{ color: 'red', textAlign: 'center', marginVertical: 8 }}>
                    {error}
                </Text>
            )}

            <FlatList
                data={auctions}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => {
                    if (loading) return null;
                    return (
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>
                            No auctions found.
                        </Text>
                    );
                }}
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
    itemDescription: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 13,
        color: '#444',
        marginTop: 2,
    },
    itemImage: { width: 100, height: 100, borderRadius: 8, marginRight: 12 },
    itemInfo: { flex: 1, justifyContent: 'space-between' },
    itemName: { fontFamily: 'Oxanium-Bold', fontSize: 16 },
    currentBidLabel: { fontFamily: 'Oxanium-Regular', color: '#666', fontSize: 12 },
    currentBidAmount: { fontFamily: 'Oxanium-Bold', color: '#28a745', fontSize: 18 },
    timeLeft: { fontFamily: 'Oxanium-SemiBold', color: '#d9534f', fontSize: 14 },
    sellerName: { fontFamily: 'Oxanium-Regular', fontSize: 12, color: '#666' },
    statusText: { fontFamily: 'Oxanium-Bold', marginTop: 4, fontSize: 14 },
});
// export default OngoingAuctions;
