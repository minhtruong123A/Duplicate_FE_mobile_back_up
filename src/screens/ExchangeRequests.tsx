import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Svg, Path } from 'react-native-svg';

// --- Types, APIs, Components ---
import { ExchangeRequestItem, ProcessedExchangeRequest, FeedbackItem } from '../types/types';
import { getReceive, ExchangeAccept, ExchangeReject } from '../services/api.exchange';
import { getOtherProfile } from '../services/api.user';
import { getFeedbackOfSellProduct } from '../services/api.feedback';
import { useAuth } from '../context/AuthContext';
import ApiImage from '../components/ApiImage';
import { useFocusEffect } from '@react-navigation/native';
import FilterBar from '../components/FilterBar'; // THÊM MỚI: Import FilterBar

const ExchangeIcon = (props: any) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M16 3h5v5M4 20L21 3M21 16v5h-5M3 4l18 18" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// --- Helper Functions ---
const statusMap: { [key: number]: { text: string; color: string } } = {
    1: { text: 'Pending', color: '#ffc107' },
    2: { text: 'Cancelled by user', color: '#6c757d' },
    3: { text: 'Rejected', color: '#dc3545' },
    4: { text: 'Finished', color: '#28a745' },
};

const getStatus = (status: number) => {
    return statusMap[status] || { text: 'Unknown', color: '#6c757d' };
};

const sortFilters = ['Newest to Oldest', 'Oldest to Newest'];

export default function ExchangeRequests() {
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState<ProcessedExchangeRequest[]>([]);

    // const [loading, setLoading] = useState(true);
    // CẬP NHẬT: Tách state loading
    const [isInitialLoading, setIsInitialLoading] = useState(true); // Chỉ dùng cho lần tải đầu tiên
    const [isRefreshing, setIsRefreshing] = useState(false); // Dùng cho chức năng pull-to-refresh

    const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // Lưu ID của request đang xử lý
    const [sortOrder, setSortOrder] = useState(sortFilters[0]); // Mặc định là gần nhất

    const loadData = useCallback(async (isRefresh = false) => {
        if (!currentUser) return;
        if (!isRefresh) {
            setIsInitialLoading(true);
        } else {
            setIsRefreshing(true);
        }
        // setLoading(true);
        try {
            const response = await getReceive();
            // CẬP NHẬT: Thêm kiểm tra 'response' để sửa lỗi TypeScript
            if (response && response.status && Array.isArray(response.data)) {
                const rawRequests: ExchangeRequestItem[] = response.data;
                const requestsFromOthers = rawRequests.filter(req => req.buyerId !== currentUser.id);
                const processedRequests = await Promise.all(
                    requestsFromOthers.map(async (req) => {
                        const [profileResponse, feedbackResponse] = await Promise.all([
                            getOtherProfile(req.buyerId),
                            req.isFeedback ? getFeedbackOfSellProduct(req.itemReciveId) : Promise.resolve(null),
                        ]);

                        let feedback: FeedbackItem[] | undefined = undefined;
                        if (feedbackResponse?.status && Array.isArray(feedbackResponse.data)) {
                            feedback = feedbackResponse.data.filter(
                                (fb: FeedbackItem) => fb.userName !== currentUser.username
                            );
                        }

                        return {
                            ...req,
                            requesterUsername: profileResponse.data?.username || 'Unknown User',
                            requesterProfileImage: profileResponse.data?.profileImage || null,
                            feedback,
                        };
                    })
                );
                setRequests(processedRequests);
            } else if (response) {
                // Xử lý trường hợp response trả về status: false
                // console.error("API call failed with status: false");
            }
        } catch (error) {
            // console.error(error);
            Alert.alert("Error", "Could not load exchange requests.");
        } finally {
            // CẬP NHẬT: Tắt đúng state loading
            if (!isRefresh) {
                setIsInitialLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    }, [currentUser]);

    // Dùng useFocusEffect để tải lại dữ liệu mỗi khi quay lại màn hình
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    // THÊM MỚI: Dùng useMemo để sắp xếp lại danh sách một cách hiệu quả
    const sortedRequests = useMemo(() => {
        const sorted = [...requests]; // Tạo bản sao để không thay đổi state gốc
        return sorted.sort((a, b) => {
            const dateA = new Date(a.datetime).getTime();
            const dateB = new Date(b.datetime).getTime();
            if (sortOrder === 'Newest to Oldest') {
                return dateB - dateA; // Gần nhất -> xa nhất (descending)
            }
            return dateA - dateB; // Xa nhất -> gần nhất (ascending)
        });
    }, [requests, sortOrder]);

    const handleResponse = async (id: string, response: 'Accepted' | 'Rejected') => {
        setIsSubmitting(id);
        try {
            // --- XỬ LÝ TRƯỜNG HỢP ACCEPT ---
            if (response === 'Accepted') {
                const apiResponse = await ExchangeAccept(id);

                // Backend trả về object với thuộc tính 'Success' (chữ S viết hoa)
                if (apiResponse.Success) {
                    Alert.alert("Success", apiResponse.Data || "Request has been accepted.");
                    await loadData(); // Tải lại danh sách
                } else {
                    // Lỗi logic nghiệp vụ từ backend
                    Alert.alert("Operation Failed", apiResponse.Error || "Failed to accept request.");
                    await loadData(); // Tải lại danh sách để xóa yêu cầu lỗi thời
                }
            }
            // --- XỬ LÝ TRƯỜNG HỢP REJECT ---
            else {
                // API Reject thành công sẽ trả về chuỗi "Rejected".
                // Nếu thất bại, nó sẽ ném ra lỗi và được khối catch ở dưới bắt.
                await ExchangeReject(id);

                // Nếu code chạy đến đây mà không bị lỗi, nghĩa là đã thành công.
                Alert.alert("Success", "Request has been rejected.");
                await loadData();
            }
        } catch (error: any) {
            // Khối catch này sẽ bắt lỗi của API Reject (400 Bad Request)
            // và các lỗi mạng/server khác cho cả 2 API.
            const errorMessage = error.response?.data || error.message || "An unknown error occurred.";
            Alert.alert("Error", errorMessage);
        } finally {
            setIsSubmitting(null);
        }
    };

    const renderItem = ({ item }: { item: ProcessedExchangeRequest }) => {
        const statusInfo = getStatus(item.status);
        // const offeredItem = item.products[0]; // Vật phẩm của họ

        return (
            <View style={styles.itemContainer}>
                <View style={styles.userInfo}>
                    <ApiImage urlPath={item.requesterProfileImage} style={styles.avatar} />
                    <View>
                        <Text style={styles.requesterName}>{item.requesterUsername} offers to trade:</Text>
                        {/* CẬP NHẬT: Hiển thị thời gian */}
                        <Text style={styles.requestDate}>
                            {new Date(item.datetime).toLocaleString('vi-VN')}
                        </Text>
                    </View>
                </View>
                <View style={styles.exchangeRow}>
                    {/* CẬP NHẬT: PHẦN VẬT PHẨM CỦA HỌ */}
                    <View style={styles.productInfo}>
                        <Text style={styles.productLabel}>Their Item(s)</Text>
                        {/* Dùng ScrollView ngang để hiển thị danh sách */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.offeredItemsScrollView}
                        >
                            {item.products.map((product, index) => (
                                <View key={index} style={styles.offeredItemContainer}>
                                    <ApiImage urlPath={product.image} style={styles.productImage} />
                                    {product.quantityProductExchange > 1 && (
                                        <View style={styles.quantityBadge}>
                                            <Text style={styles.quantityBadgeText}>x{product.quantityProductExchange}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.productName} numberOfLines={2}>
                                        ID: {product.productExchangeId.slice(-6)}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                    <ExchangeIcon />
                    <View style={styles.productInfo}>
                        <Text style={styles.productLabel}>Your Item</Text>
                        <ApiImage urlPath={item.iamgeItemRecive} style={styles.productImage} />
                        <Text style={styles.productName} numberOfLines={2}>
                            ID: {item.itemReciveId.slice(-6)}
                        </Text>
                    </View>
                </View>

                {item.feedback && item.feedback.length > 0 && (
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackTitle}>Feedback from user:</Text>
                        {item.feedback.map(fb => (
                            <Text key={fb.id} style={styles.feedbackContent}>• "{fb.content}" ({fb.rating}★)</Text>
                        ))}
                    </View>
                )}

                {item.status === 1 ? ( // Chỉ hiển thị nút nếu status là Pending
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleResponse(item.id, 'Rejected')}
                            disabled={isSubmitting === item.id}
                        >
                            <Text style={styles.rejectButtonText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.acceptButton]}
                            onPress={() => handleResponse(item.id, 'Accepted')}
                            disabled={isSubmitting === item.id}
                        >
                            {isSubmitting === item.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.acceptButtonText}>Accept</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                )}
            </View>
        );
    };

    if (isInitialLoading) {
        return <SafeAreaView style={styles.centerContainer}><ActivityIndicator size="large" color="#d9534f" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* THÊM MỚI: Thanh FilterBar để sắp xếp */}
            <FilterBar
                filters={sortFilters}
                activeFilter={sortOrder}
                onSelectFilter={(filter) => setSortOrder(filter)}
            />
            <FlatList
                // data={requests}
                data={sortedRequests} // CẬP NHẬT: Dùng dữ liệu đã sắp xếp
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>You have no incoming exchange requests.</Text>
                    </View>
                }
                onRefresh={() => loadData(true)} // Gọi loadData với cờ refresh
                refreshing={isRefreshing} // Chỉ dùng state isRefreshing
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
    // Thêm style mới cho feedback và loading
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontFamily: 'Oxanium-Regular', fontSize: 16, color: '#888' },
    feedbackContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: 12,
        paddingTop: 12,
    },
    feedbackTitle: {
        fontFamily: 'Oxanium-SemiBold',
        fontSize: 14,
        marginBottom: 4,
    },
    feedbackContent: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 14,
        color: '#555',
        fontStyle: 'italic',
    },
    requestDate: { // Style mới cho ngày tháng
        fontFamily: 'Oxanium-Regular',
        fontSize: 12,
        color: '#888',
    },
    offeredItemsScrollView: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    offeredItemContainer: {
        alignItems: 'center',
        marginRight: 8, // Khoảng cách giữa các vật phẩm trong danh sách ngang
        width: 100, // Cố định chiều rộng để dễ nhìn
    },
    quantityBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(217, 83, 79, 0.9)', // Màu đỏ mờ
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    quantityBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Oxanium-Bold',
    },
});
