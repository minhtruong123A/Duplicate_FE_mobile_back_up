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
    id: string;
    title: string;
    descripition: string;
    start_time: string;
    end_time: string;
    seller_id: string;
    status: number; // 0: Pending, 1: Approved/Ongoing, -1: Denied
    productImageUrl?: string;
    host_value: number;
    fee_charge: string;
    incoming_value: number;
};

type AuctionWithSeller = AuctionItem & {
    seller: UserProfile | null;
};

// --- Helper Functions ---
const formatTimeLeft = (endTime?: string | null) => {
    if (!endTime) return 'Unknown end time';
    const ms = new Date(endTime).getTime() - Date.now();
    if (isNaN(ms)) return 'Invalid time';
    if (ms <= 0) return "Ended";

    const MS_IN_DAY = 24 * 60 * 60 * 1000;
    const MS_IN_HOUR = 60 * 60 * 1000;
    const MS_IN_MIN = 60 * 1000;

    const days = Math.floor(ms / MS_IN_DAY);
    const hours = Math.floor((ms % MS_IN_DAY) / MS_IN_HOUR);
    const minutes = Math.floor((ms % MS_IN_HOUR) / MS_IN_MIN);

    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return `Ends in: ${parts.join(' ')}`;
};

const MS_IN_24H = 24 * 60 * 60 * 1000;

const formatDuration = (ms: number) => {
    if (ms <= 0) return '0m';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

// helpers (thay thế hiện tại)
const formatDateTime = (iso?: string | null) => {
    if (!iso) return 'Unknown time';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Invalid time';
    try {
        // ưu tiên format theo vi-VN + timezone VN nếu khả dụng
        // Intl may not be available on some RN engines — try/catch để fallback
        return new Intl.DateTimeFormat('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(d);
    } catch {
        // fallback đơn giản
        return d.toString();
    }
};


const getStatusInfo = (item: AuctionItem): { text: string; color: string } => {
    // bảo vệ nếu start_time hoặc end_time thiếu hoặc không parse được
    if (!item.start_time || !item.end_time) {
        console.warn('[getStatusInfo] Missing start_time/end_time for auction', item._id, item.start_time, item.end_time);
        return { text: 'Invalid time', color: '#6c757d' };
    }

    // chuyển sang số (ms) để so sánh / trừ an toàn
    const now = Date.now(); // number
    const start = new Date(item.start_time).getTime(); // number
    const end = new Date(item.end_time).getTime(); // number

    if (isNaN(start) || isNaN(end)) {
        console.warn('[getStatusInfo] Invalid date parse for auction', item._id, item.start_time, item.end_time);
        return { text: 'Invalid time', color: '#6c757d' };
    }

    switch (item.status) {
        case 0: {
            // Pending: show start date (date string)
            const startDateStr = new Date(item.start_time).toLocaleDateString();
            return { text: `Pending (Starts ${startDateStr})`, color: '#ffc107' };
        }
        case 1: {
            // Approved/Ongoing
            if (now > end) return { text: 'Ended', color: '#6c757d' };

            if (now < start) {
                const msUntilStart = start - now; // safe: number - number
                if (msUntilStart >= MS_IN_24H) {
                    // còn >= 24h: show exact date + time
                    return { text: `Starts: ${formatDateTime(item.start_time)}`, color: '#17a2b8' };
                } else {
                    // < 24h: show countdown
                    return { text: `Starts in: ${formatDuration(msUntilStart)}`, color: '#17a2b8' };
                }
            }

            // else: đang diễn ra (now >= start && now <= end)
            return { text: formatTimeLeft(item.end_time), color: '#28a745' };
        }
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
        console.log(item.id);
        const status = getStatusInfo(item);
        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => navigation.navigate('AuctionDetail', {
                    auctionId: item.id || item._id,
                    startTime: item.start_time,
                    endTime: item.end_time,
                })}            >
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
                    {activeFilter === 'Hosted' && (
                        <View style={styles.hostedInfoContainer}>
                            <Text style={styles.hostedInfoText}>
                                Initial:
                                <Text style={styles.valueText}>
                                    {/* Kiểm tra xem item.host_value có phải là một số không */}
                                    {typeof item.host_value === 'number'
                                        ? `${item.host_value.toLocaleString('vi-VN')} VND`
                                        : 'N/A'}
                                </Text>
                            </Text>
                            <Text style={styles.hostedInfoText}>
                                Est. Income:
                                <Text style={[styles.valueText, { color: '#28a745' }]}>
                                    {/* Kiểm tra tương tự cho item.incoming_value */}
                                    {typeof item.incoming_value === 'number'
                                        ? `${item.incoming_value.toLocaleString('vi-VN')} VND`
                                        : 'N/A'}
                                </Text>
                            </Text>
                        </View>
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
    // CẬP NHẬT: Đổi tên style cho nhất quán
    hostedInfoContainer: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    hostedInfoText: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 12,
        color: '#666',
    },
    valueText: {
        fontFamily: 'Oxanium-SemiBold',
        color: '#333',
    },
});