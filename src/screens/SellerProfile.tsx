import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList,
    TouchableOpacity, Modal, TextInput, Alert, TouchableWithoutFeedback, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { RootStackScreenProps, RootStackNavigationProp, UserProfile, ProductOnSaleItem } from '../types/types';
import { getOtherProfile } from '../services/api.user';
import { getAllProductOnSaleOfUser } from '../services/api.user';
import ApiImage from '../components/ApiImage';

// THÊM MỚI: Import hook useAuth
import { useAuth } from '../context/AuthContext';

// Component ReportModal giữ nguyên
// Component ReportModal có thể giữ nguyên không đổi
// const ReportModal = ({ visible, onClose, onSubmit }: { visible: boolean, onClose: () => void, onSubmit: (title: string, content: string) => void }) => {
//     // ... (code của ReportModal giữ nguyên)
//     const [title, setTitle] = useState('');
//     const [content, setContent] = useState('');
//     const handleSubmit = () => {
//         if (!title.trim() || !content.trim()) {
//             Alert.alert("Error", "Please fill in all required fields.");
//             return;
//         }
//         onSubmit(title, content);
//         setTitle('');
//         setContent('');
//     };
//     return (
//         <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
//             <TouchableWithoutFeedback onPress={onClose}>
//                 <View style={styles.modalOverlay}>
//                     <TouchableWithoutFeedback>
//                         <View style={styles.modalContainer}>
//                             <Text style={styles.modalTitle}>Report seller</Text>
//                             <TextInput placeholder="Title" style={styles.modalInput} value={title} onChangeText={setTitle} />
//                             <TextInput placeholder="Content" style={[styles.modalInput, { height: 100 }]} multiline value={content} onChangeText={setContent} />
//                             <View style={styles.modalButtonRow}>
//                                 <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#eee' }]} onPress={onClose}>
//                                     <Text>Cancel</Text>
//                                 </TouchableOpacity>
//                                 <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#d9534f' }]} onPress={handleSubmit}>
//                                     <Text style={{ color: '#fff' }}>Send</Text>
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                     </TouchableWithoutFeedback>
//                 </View>
//             </TouchableWithoutFeedback>
//         </Modal>
//     );
// };

export default function SellerProfile({ route }: RootStackScreenProps<'SellerProfile'>) {
    const navigation = useNavigation<RootStackNavigationProp>();
    const { sellerId } = route.params;

    // THÊM MỚI: Lấy thông tin người dùng đang đăng nhập từ context
    const { user: currentUser } = useAuth();

    const [seller, setSeller] = useState<UserProfile | null>(null);
    const [products, setProducts] = useState<ProductOnSaleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isFollowing, setIsFollowing] = useState(false);
    const [isReportModalVisible, setReportModalVisible] = useState(false);

    // THÊM MỚI: Kiểm tra xem đây có phải là trang cá nhân của chính mình không
    const isMyProfile = currentUser?.id === sellerId;

    useEffect(() => {
        const fetchData = async () => {
            if (!sellerId) {
                setError("Seller ID is missing.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const [profileResponse, productsResponse] = await Promise.all([
                    getOtherProfile(sellerId),
                    getAllProductOnSaleOfUser(sellerId)
                ]);

                if (profileResponse.status && profileResponse.data) {
                    setSeller(profileResponse.data);
                } else {
                    throw new Error("Could not fetch seller profile.");
                }
                if (productsResponse.status && Array.isArray(productsResponse.data)) {
                    const availableProducts = productsResponse.data.filter((p: ProductOnSaleItem) => p.quantity > 0 && p.isSell);
                    setProducts(availableProducts);
                } else {
                    setProducts([]);
                }
                setError(null);
            } catch (err: any) {
                setError(err.message || 'An error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [sellerId]);

    const handleReportSubmit = (title: string, content: string) => {
        // ... code không đổi
    };

    const renderProductItem = ({ item }: { item: ProductOnSaleItem }) => (
        <TouchableOpacity
            style={styles.productItem}
            onPress={() => navigation.navigate('MainTabs', {
                screen: 'Shop',
                params: {
                    screen: 'Collection Detail',
                    params: { productId: item.id }
                }
            })}
        >
            <ApiImage urlPath={item.urlImage} style={styles.productImage} />
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return <SafeAreaView style={styles.centerContainer}><ActivityIndicator size="large" color="#d9534f" /></SafeAreaView>;
    }

    if (error || !seller) {
        return <SafeAreaView style={styles.centerContainer}><Text>{error || 'Cannot find seller.'}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <ReportModal visible={isReportModalVisible} onClose={() => setReportModalVisible(false)} onSubmit={handleReportSubmit} /> */}

            <View style={styles.profileHeader}>
                <ApiImage urlPath={seller.profileImage} style={styles.avatar} />
                <Text style={styles.sellerName}>{seller.username}</Text>

                {/* CẬP NHẬT: Chỉ hiển thị các nút này nếu không phải là profile của mình */}
                {!isMyProfile && (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('Chatbox', { userName: seller.username, avatarUrl: seller.profileImage || '' })}
                        >
                            <Text style={styles.actionButtonText}>Chat</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                            style={[styles.actionButton, isFollowing && styles.followingButton]}
                            onPress={() => setIsFollowing(!isFollowing)}
                        >
                            <Text style={[styles.actionButtonText, isFollowing && styles.followingButtonText]}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        </TouchableOpacity> */}
                        {/* <TouchableOpacity style={styles.actionButton} onPress={() => setReportModalVisible(true)}>
                            <Text style={styles.actionButtonText}>Report</Text>
                        </TouchableOpacity> */}
                    </View>
                )}
            </View>

            <Text style={styles.sectionTitle}>
                {isMyProfile ? "My products on sale" : `Other products on sale from ${seller.username}`}
            </Text>
            <FlatList
                data={products}
                renderItem={renderProductItem}
                keyExtractor={item => item.id}
                numColumns={3}
                contentContainerStyle={styles.productList}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {isMyProfile ? "You have no products for sale." : "This seller has no products for sale."}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

// CẬP NHẬT: Thêm styles cho centerContainer và emptyContainer
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    profileHeader: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e0e0e0' },
    sellerName: { fontSize: 24, fontFamily: 'Oxanium-Bold', marginVertical: 12 },
    buttonRow: { flexDirection: 'row', justifyContent: 'center' },
    actionButton: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, marginHorizontal: 8 },
    actionButtonText: { fontFamily: 'Oxanium-SemiBold', fontSize: 14 },
    followingButton: { backgroundColor: '#d9534f', borderColor: '#d9534f' },
    followingButtonText: { color: '#fff' },
    sectionTitle: { fontSize: 18, fontFamily: 'Oxanium-Bold', padding: 16, backgroundColor: '#f8f9fa' },
    productList: { paddingHorizontal: 12 },
    productItem: { width: '30%', margin: '1.66%', alignItems: 'center' },
    productImage: { width: 100, height: 140, borderRadius: 8, backgroundColor: '#eee' },
    productName: { fontFamily: 'Oxanium-Regular', marginTop: 4, textAlign: 'center' },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        fontFamily: 'Oxanium-Regular',
    },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontFamily: 'Oxanium-Bold', marginBottom: 16 },
    modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, fontFamily: 'Oxanium-Regular' },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
    modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
});