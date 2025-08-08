// src/screens/SellerProfile.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, FlatList, Modal, TextInput, Alert, TouchableWithoutFeedback } from 'react-native';
import { fakeUserData } from '../data/userData';
import { fakeProductData, ProductCard } from '../data/productData';
import { RootStackScreenProps } from '../types/types';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/types';

const ReportModal = ({ visible, onClose, onSubmit }: { visible: boolean, onClose: () => void, onSubmit: (title: string, content: string) => void }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }
        onSubmit(title, content);
        setTitle('');
        setContent('');
    };

    return (
        <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Report seller</Text>
                            <TextInput placeholder="Title" style={styles.modalInput} value={title} onChangeText={setTitle} />
                            <TextInput placeholder="Content" style={[styles.modalInput, { height: 100 }]} multiline value={content} onChangeText={setContent} />
                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#eee' }]} onPress={onClose}>
                                    <Text>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#d9534f' }]} onPress={handleSubmit}>
                                    <Text style={{ color: '#fff' }}>Send</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};


export default function SellerProfile({ route }: RootStackScreenProps<'SellerProfile'>) {
    const navigation = useNavigation<RootStackNavigationProp>();
    const { sellerId } = route.params;
    const [isFollowing, setIsFollowing] = useState(false);
    const [isReportModalVisible, setReportModalVisible] = useState(false);

    const seller = fakeUserData.find(user => user.id === sellerId);
    const sellerProducts = fakeProductData.filter(product => product.sellerId === sellerId);

    if (!seller) {
        return <SafeAreaView><Text>Cannot find seller.</Text></SafeAreaView>;
    }

    const handleReportSubmit = (title: string, content: string) => {
        console.log({ title, content });
        setReportModalVisible(false);
        Alert.alert("Success", "Your report has been sent.");
    };

    const renderProductItem = ({ item }: { item: ProductCard }) => (
        // CẬP NHẬT: Thêm onPress để điều hướng
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
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ReportModal visible={isReportModalVisible} onClose={() => setReportModalVisible(false)} onSubmit={handleReportSubmit} />
            <View style={styles.profileHeader}>
                <Image source={{ uri: seller.avatarUrl }} style={styles.avatar} />
                <Text style={styles.sellerName}>{seller.name}</Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Chatbox', { userName: seller.name, avatarUrl: seller.avatarUrl })}
                    >
                        <Text style={styles.actionButtonText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, isFollowing && styles.followingButton]}
                        onPress={() => setIsFollowing(!isFollowing)}
                    >
                        <Text style={[styles.actionButtonText, isFollowing && styles.followingButtonText]}>
                            {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => setReportModalVisible(true)}>
                        <Text style={styles.actionButtonText}>Report</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.sectionTitle}>Other products on sale from {seller.name}</Text>
            <FlatList
                data={sellerProducts}
                renderItem={renderProductItem}
                keyExtractor={item => item.id}
                numColumns={3}
                contentContainerStyle={styles.productList}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    profileHeader: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    avatar: { width: 100, height: 100, borderRadius: 50 },
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
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontFamily: 'Oxanium-Bold', marginBottom: 16 },
    modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, fontFamily: 'Oxanium-Regular' },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
    modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
});
