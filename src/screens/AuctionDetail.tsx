import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList, AppState } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


// --- Types, APIs, Components ---
import { RootStackScreenProps, AuctionProduct, CollectionDetailItem, AuctionDetailData, UserProfile, BidHistoryItem, AppNavigationProp } from '../types/types';
import { fetchAuctionProduct, joinAuction, getBidAuction, addBidAuction, checkIsJoinedAuction } from '../services/api.auction';
import { getCollectionDetail } from '../services/api.product';
import { getOtherProfile } from '../services/api.user';
import ApiImage from '../components/ApiImage';
import AuctionSocket from '../config/auctionSocket';
import { useAuth } from '../context/AuthContext';
import { PYTHON_API_BASE_URL } from '../config/axios';

const getRarityColor = (rarity?: string) => {
    if (!rarity) return '#000';
    const lowerRarity = rarity.toLowerCase();
    switch (lowerRarity) {
        case 'legendary': return '#FFD700'; case 'epic': return '#A020F0';
        case 'rare': return '#1E90FF'; case 'uncommon': return '#32CD32';
        case 'common': return '#A9A9A9'; default: return '#000';
    }
};

export default function AuctionDetail({ route }: RootStackScreenProps<'AuctionDetail'>) {
    const { auctionId, startTime, endTime } = route.params;
    const navigation = useNavigation<AppNavigationProp>();
    const { user: currentUser, userToken, isAuctionJoined } = useAuth();
    const [auctionData, setAuctionData] = useState<AuctionDetailData | null>(null);
    const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
    const [hasJoinedThisSession, setHasJoinedThisSession] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bidAmount, setBidAmount] = useState('');
    const socketRef = useRef<AuctionSocket | null>(null);
    const PENDING_AUCTION_KEY = `pendingAuction_${currentUser?.id}`;
    const initializeWebSocket = useCallback(async (sessionId: string) => {
        try {
            const historyRes = await getBidAuction(sessionId);
            if (historyRes.success && Array.isArray(historyRes.data)) {
                const processedHistory = await Promise.all(
                    historyRes.data.map(async (bid: any) => {
                        let bidderUsername = 'A bidder';
                        try {
                            const profileRes = await getOtherProfile(bid.bidder_id);
                            if (profileRes.status && profileRes.data) {
                                bidderUsername = profileRes.data.username;
                            }
                        } catch { /* Bỏ qua lỗi */ }
                        return {
                            _id: bid._id,
                            user_id: bid.bidder_id,
                            username: bidderUsername,
                            price: bid.bid_amount,
                            created_at: bid.bid_time.replace(" ", "T") + "Z",
                        };
                    })
                );
                setBidHistory(processedHistory);
            }
        } catch (error) {
            console.error("Failed to fetch initial bid history", error);
        }

        if (socketRef.current) socketRef.current.close();
        const socket = new AuctionSocket({
            urlBase: PYTHON_API_BASE_URL,
            auctionId: sessionId,
            token: userToken || '',
            debug: true,
            reconnect: true,
        });

        // SỬA LỖI LOGIC HOÀN CHỈNH
        socket.onmessage = async (payload) => {
            console.log("WebSocket message received:", payload);

            if (payload && payload.bid_amount && payload.bidder_id) {
                const newPrice = parseFloat(payload.bid_amount);

                // 1. Cập nhật giá mới nhất
                setAuctionData(prevData => {
                    if (!prevData) return null;
                    return { ...prevData, currentPrice: newPrice };
                });

                // 2. Lấy username của người vừa bid
                let bidderUsername = 'A bidder';
                try {
                    const profileRes = await getOtherProfile(payload.bidder_id);
                    if (profileRes.status && profileRes.data) {
                        bidderUsername = profileRes.data.username;
                    }
                } catch (e) {
                    console.error("Could not fetch bidder profile", e);
                }

                // 3. Sửa định dạng ngày tháng
                const formattedDate = (payload.bid_time || "").replace(" ", "T") + "Z";

                // 4. Tạo object bid mới
                const newBid: BidHistoryItem = {
                    _id: `ws-${Date.now()}`,
                    user_id: payload.bidder_id,
                    username: bidderUsername,
                    price: newPrice,
                    created_at: formattedDate,
                };

                // 5. Thêm vào đầu danh sách lịch sử
                setBidHistory(prevHistory => [newBid, ...prevHistory]);
            }
        };
        socket.onclose = () => console.log("WebSocket disconnected.");
        socketRef.current = socket;
    }, [userToken]);

    // --- Data Fetching ---
    // Bọc logic fetch chính trong useCallback
    const loadInitialData = useCallback(async () => {
        try {
            setLoading(true);
            const auctionProductRes = await fetchAuctionProduct(auctionId);
            if (!auctionProductRes.success || !auctionProductRes.data || auctionProductRes.data.length === 0) {
                throw new Error("Auction product not found.");
            }
            const auctionProduct: AuctionProduct = auctionProductRes.data[0];
            const [productDetailRes, sellerProfileRes] = await Promise.all([
                getCollectionDetail(auctionProduct.user_product_id),
                getOtherProfile(auctionProduct.seller_id)
            ]);

            if (!productDetailRes.status || !productDetailRes.data) throw new Error("Product details not found.");
            if (!sellerProfileRes.status || !sellerProfileRes.data) throw new Error("Seller profile not found.");

            const productDetail: CollectionDetailItem = productDetailRes.data;
            const sellerProfile: UserProfile = sellerProfileRes.data;

            setAuctionData({
                auctionProductId: auctionProduct._id,
                startingPrice: auctionProduct.starting_price,
                currentPrice: auctionProduct.current_price,
                quantity: auctionProduct.quantity,
                sellerId: auctionProduct.seller_id,
                productName: productDetail.name,
                productImageUrl: productDetail.urlImage,
                productRarity: productDetail.rarityName,
                description: productDetail.description,
                sellerUsername: sellerProfile.username,
                sellerProfileImage: sellerProfile.profileImage,
                auctionSessionId: auctionProduct.auction_session_id,
            });

            const storedAuctionId = await AsyncStorage.getItem(PENDING_AUCTION_KEY);
            console.log("go go poweranger" + PENDING_AUCTION_KEY);
            if (storedAuctionId && storedAuctionId === auctionProduct.auction_session_id) {
                setHasJoinedThisSession(true);
                await initializeWebSocket(auctionProduct.auction_session_id);
            }

            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to load auction details.");
        } finally {
            setLoading(false);
        }
    }, [auctionId, initializeWebSocket, PENDING_AUCTION_KEY]);

    // useEffect để gọi hàm loadData
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        return () => {
            // Chỉ cần đóng socket khi thoát màn hình
            socketRef.current?.close();
        };
    }, []);

    // HÀM ĐÃ ĐƯỢC VIẾT LẠI THEO LOGIC MỚI
    const handleJoinAuction = async () => {
        if (!auctionData) return;
        Alert.alert(
            "Join Auction",
            "Are you sure you want to join this auction? For the next 15 minutes, you will not be able to purchase items or request withdrawals. Do you want to continue?",
            [
                { text: "Cancel", style: 'cancel' },
                {
                    text: "OK",
                    onPress: async () => {
                        setIsJoining(true);
                        try {
                            // BƯỚC 1: Kiểm tra trước
                            const checkRes = await checkIsJoinedAuction();

                            // Case 1: Đã tham gia rồi -> Vào thẳng
                            if (checkRes?.success && checkRes.data?.[0] === true) {
                                console.log("User has already joined. Proceeding...");
                                setHasJoinedThisSession(true);
                                await initializeWebSocket(auctionData.auctionSessionId);
                            }
                            // Case 2: Chưa tham gia -> Gọi API join
                            else if (checkRes?.success && checkRes.data?.[0] === false) {
                                console.log("User has not joined. Attempting to join...");
                                const joinRes = await joinAuction(auctionData.auctionSessionId);
                                console.log("joinRes raw:", joinRes);
                                console.log("joinRes.error (json):", JSON.stringify(joinRes?.error));
                                if (!joinRes.success && joinRes.error?.includes("already joined !")) {
                                    console.log("hahahahahahahah")
                                    setHasJoinedThisSession(true);
                                    await initializeWebSocket(auctionData.auctionSessionId);
                                } else if (joinRes.success) {
                                    // Lỗi từ API joinAuction
                                    const setupgogo = await AsyncStorage.setItem(PENDING_AUCTION_KEY, auctionData.auctionSessionId);
                                    console.log("check auction" + setupgogo);
                                    setHasJoinedThisSession(true);
                                    await initializeWebSocket(auctionData.auctionSessionId);
                                } else {
                                    throw new Error(joinRes.error || "Failed to join auction.");
                                }
                            }
                            // // Case 3: Lỗi từ API checkIsJoinedAuction
                            // else {
                            //     throw new Error(checkRes?.error || "Could not check auction status.");
                            // }
                        } catch (err: any) {
                            Alert.alert("Error", err.message || "An error occurred.");
                        } finally {
                            setIsJoining(false);
                        }
                    }
                }
            ]
        );
    };

    const handlePlaceBid = async () => {
        if (!auctionData) return;
        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount <= auctionData.currentPrice) {
            Alert.alert("Invalid Bid", `Your bid must be higher than ${auctionData.currentPrice.toLocaleString('vi-VN')} VND.`);
            return;
        }

        try {
            const bidRes = await addBidAuction(auctionData.auctionSessionId, amount);
            if (bidRes.success) {
                Alert.alert("Success", "Your bid has been placed.");
                setBidAmount('');
            } else {
                throw new Error(bidRes.error || "Failed to place bid.");
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "An error occurred.");
        }
    };

    if (loading) {
        return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} size="large" color="#d9534f" /></SafeAreaView>;
    }

    if (error || !auctionData) {
        return <SafeAreaView style={styles.container}><Text style={styles.errorText}>{error || 'Auction not found.'}</Text></SafeAreaView>;
    }

    const isMyAuction = currentUser?.id === auctionData.sellerId;
    // SỬA LỖI: Thêm hàm helper để đảm bảo thời gian được xử lý là UTC
    const ensureUtc = (timeStr: string) => {
        if (!timeStr) return new Date(0);
        return new Date(timeStr.endsWith('Z') ? timeStr : timeStr + 'Z');
    };

    const now = new Date();
    const startDate = ensureUtc(startTime); // Dùng hàm helper
    const endDate = ensureUtc(endTime);     // Dùng hàm helper
    let auctionLiveStatus: 'Upcoming' | 'Ongoing' | 'Finished' = 'Ongoing';

    if (now < startDate) {
        auctionLiveStatus = 'Upcoming';
    } else if (now > endDate) {
        auctionLiveStatus = 'Finished';
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <ApiImage urlPath={auctionData.productImageUrl} style={styles.productImage} />
                <View style={styles.priceInfo}>
                    <Text style={styles.priceLabel}>Highest Bid:</Text>
                    <Text style={[styles.priceValue, { color: '#28a745' }]}>{(auctionData.currentPrice ?? 0).toLocaleString('vi-VN')} VND</Text>
                </View>
                <View style={styles.infoContainer}>
                    {/* PHẦN CODE ĐƯỢC THÊM LẠI */}
                    <View style={styles.nameRow}>
                        <Text style={styles.productName}>{auctionData.productName}</Text>
                        <View style={[styles.rarityBadge, { borderColor: getRarityColor(auctionData.productRarity) }]}>
                            <Text style={[styles.rarityText, { color: getRarityColor(auctionData.productRarity) }]}>
                                {auctionData.productRarity.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.sellerContainer} onPress={() => navigation.navigate('SellerProfile', { sellerId: auctionData.sellerId })}>
                        <ApiImage urlPath={auctionData.sellerProfileImage} style={styles.sellerAvatar} />
                        <Text style={styles.sellerName}>by {auctionData.sellerUsername}</Text>
                    </TouchableOpacity>

                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>Starting Price:</Text>
                        <Text style={styles.priceValue}>{(auctionData.startingPrice ?? 0).toLocaleString('vi-VN')} VND</Text>
                    </View>
                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>Highest Bid:</Text>
                        <Text style={[styles.priceValue, { color: '#28a745' }]}>{(auctionData.currentPrice ?? 0).toLocaleString('vi-VN')} VND</Text>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{auctionData.description}</Text>
                    <View style={styles.divider} />
                    {/* KẾT THÚC PHẦN CODE ĐƯỢC THÊM LẠI */}
                    <Text style={styles.sectionTitle}>Bid History ({bidHistory.length} bids)</Text>
                    {hasJoinedThisSession ? (
                        <FlatList
                            data={bidHistory}
                            keyExtractor={item => item._id}
                            renderItem={({ item }) => (
                                <View style={styles.historyItem}>
                                    <Text style={styles.bidderName}>{item.username}</Text>
                                    <Text style={styles.bidAmount}>{(item.price ?? 0).toLocaleString('vi-VN')} VND</Text>
                                    <Text style={styles.bidTimestamp}>{new Date(item.created_at).toLocaleTimeString('vi-VN')}</Text>
                                </View>
                            )}
                            scrollEnabled={false}
                        />
                    ) : (
                        <Text style={styles.placeholderText}>Join the auction to see bid history.</Text>
                    )}
                </View>
            </ScrollView>
            <View style={styles.footer}>
                {isMyAuction ? (
                    <View style={[styles.joinButton, styles.disabledButton]}>
                        <Text style={styles.joinButtonText}>This is Your Auction</Text>
                    </View>
                ) : isAuctionJoined && !hasJoinedThisSession ? (
                    <View style={[styles.joinButton, styles.disabledButton]}>
                        <Text style={styles.joinButtonText}>You are in another auction</Text>
                    </View>
                ) : (
                    <>
                        {!hasJoinedThisSession ? (
                            <>
                                {auctionLiveStatus === 'Ongoing' && (
                                    <TouchableOpacity style={[styles.joinButton, isJoining && styles.disabledButton]} onPress={handleJoinAuction} disabled={isJoining}>
                                        {isJoining ? <ActivityIndicator color="#fff" /> : <Text style={styles.joinButtonText}>Join Auction</Text>}
                                    </TouchableOpacity>
                                )}
                                {auctionLiveStatus === 'Upcoming' && (
                                    <View style={[styles.joinButton, styles.disabledButton]}>
                                        <Text style={styles.joinButtonText}>Upcoming</Text>
                                    </View>
                                )}
                                {auctionLiveStatus === 'Finished' && (
                                    <View style={[styles.joinButton, styles.disabledButton]}>
                                        <Text style={styles.joinButtonText}>Finished</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.bidInputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={`Bid > ${(auctionData.currentPrice ?? 0).toLocaleString('vi-VN')} VND`}
                                    keyboardType="numeric"
                                    value={bidAmount}
                                    onChangeText={setBidAmount}
                                />
                                <TouchableOpacity style={styles.bidButton} onPress={handlePlaceBid}>
                                    <Text style={styles.bidButtonText}>Place Bid</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { flex: 1, textAlign: 'center', textAlignVertical: 'center', color: 'red' },
    productImage: { width: '100%', height: 350, resizeMode: 'contain', backgroundColor: '#f0f2f5' },
    infoContainer: { padding: 16 },

    // Styles cho Tên và Độ hiếm
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    productName: {
        fontSize: 24,
        fontFamily: 'Oxanium-Bold',
        flex: 1,
        marginRight: 8,
    },
    rarityBadge: {
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    rarityText: {
        fontFamily: 'Oxanium-Bold',
        fontSize: 12,
    },

    // Styles cho Thông tin người bán
    sellerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    sellerAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
    },
    sellerName: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 14,
        color: '#666'
    },

    // Styles cho Giá
    priceInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    priceLabel: { fontSize: 16, fontFamily: 'Oxanium-Regular', color: '#666' },
    priceValue: { fontSize: 16, fontFamily: 'Oxanium-Bold' },

    // Styles chung
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
    sectionTitle: { fontSize: 18, fontFamily: 'Oxanium-Bold', marginBottom: 12 },
    descriptionText: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 16,
        lineHeight: 24,
        color: '#333'
    },
    placeholderText: {
        fontFamily: 'Oxanium-Regular',
        fontStyle: 'italic',
        color: '#888',
        textAlign: 'center',
        paddingVertical: 20,
    },

    // Styles cho Lịch sử đấu giá
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5'
    },
    bidderName: { flex: 1, fontFamily: 'Oxanium-SemiBold', fontSize: 15 },
    bidAmount: { flex: 1, fontFamily: 'Oxanium-Regular', textAlign: 'center', fontSize: 15 },
    bidTimestamp: { flex: 1, fontFamily: 'Oxanium-Regular', color: '#999', textAlign: 'right', fontSize: 14 },

    // --- STYLES MỚI CHO FOOTER VÀ CÁC NÚT ---
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    joinButton: {
        backgroundColor: '#28a745', // Màu xanh lá
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinButtonText: {
        fontSize: 18,
        fontFamily: 'Oxanium-Bold',
        color: '#fff',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    bidInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginRight: 8,
        fontFamily: 'Oxanium-Regular',
        fontSize: 16
    },
    bidButton: {
        backgroundColor: '#d9534f',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center'
    },
    bidButtonText: {
        color: '#fff',
        fontFamily: 'Oxanium-Bold',
        fontSize: 16
    },
});