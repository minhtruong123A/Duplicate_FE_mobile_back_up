import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
    KeyboardAvoidingView,
    Modal,
    FlatList
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AppNavigationProp, ProductOnSaleItem } from '../types/types';
// CẬP NHẬT: Import các API cần thiết
import { GetMyUserProductToAuctionList, newAuction, productOfAuction, fetchMyAuctionList } from '../services/api.auction';
import { getCollectionDetail } from '../services/api.product'; // Cần API này để lấy tên và ảnh
import ApiImage from '../components/ApiImage';
import DateTimePicker from '@react-native-community/datetimepicker';

// Bạn nên dùng một thư viện date picker chuyên dụng để có trải nghiệm tốt hơn
// import DateTimePicker from '@react-native-community/datetimepicker';

// --- Type Definitions ---
// Type cho sản phẩm sau khi đã xử lý (thêm tên và ảnh)
type SelectableProduct = {
    userProductId: string; // _id từ GetMyUserProductToAuctionList
    productId: string;     // ProductId từ GetMyUserProductToAuctionList
    name: string;
    urlImage: string | null;
    quantity: number;
};

// --- Components ---
const ProductSelector = ({ selectedProduct, onSelect, disabled }: { selectedProduct: SelectableProduct | null, onSelect: () => void, disabled: boolean }) => (
    <TouchableOpacity style={[styles.input, disabled && styles.disabledInput]} onPress={onSelect} disabled={disabled}>
        {selectedProduct ? (
            <View style={styles.productSelectorRow}>
                <ApiImage urlPath={selectedProduct.urlImage} style={styles.productSelectorImage} />
                <Text style={styles.productSelectorText}>{selectedProduct.name}</Text>
            </View>
        ) : (
            <Text style={styles.placeholderText}>Select a product from your collection</Text>
        )}
    </TouchableOpacity>
);

const ProductSelectionModal = ({ visible, products, onSelect, onClose }: { visible: boolean, products: SelectableProduct[], onSelect: (product: SelectableProduct) => void, onClose: () => void }) => (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
        <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select a Product</Text>
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.userProductId}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.productItem} onPress={() => onSelect(item)}>
                            <ApiImage urlPath={item.urlImage} style={styles.productSelectorImage} />
                            <View>
                                <Text style={styles.productSelectorText}>{item.name}</Text>
                                <Text style={styles.quantityText}>Available: {item.quantity}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </TouchableOpacity>
    </Modal>
);


export default function AddAuction() {
    const navigation = useNavigation<AppNavigationProp>();

    // --- State Management ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startingPrice, setStartingPrice] = useState('');
    const [quantity, setQuantity] = useState('1');

    const [startTime, setStartTime] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    const [myProducts, setMyProducts] = useState<SelectableProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<SelectableProduct | null>(null);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);

    // --- Data Fetching ---
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const response = await GetMyUserProductToAuctionList();
                    if (response.success && Array.isArray(response.data)) {
                        // Lấy thông tin chi tiết (tên, ảnh) cho mỗi sản phẩm
                        const detailedProducts = await Promise.all(
                            response.data.map(async (p: any) => {
                                const detailRes = await getCollectionDetail(p.ProductId);
                                if (detailRes.status && detailRes.data) {
                                    return {
                                        userProductId: p._id,
                                        productId: p.ProductId,
                                        name: detailRes.data.name,
                                        urlImage: detailRes.data.urlImage,
                                        quantity: p.Quantity,
                                    };
                                }
                                return null;
                            })
                        );
                        setMyProducts(detailedProducts.filter(Boolean) as SelectableProduct[]);
                    }
                } catch (error) {
                    Alert.alert("Error", "Could not load your products.");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, [])
    );

    // --- Handlers ---
    const handleSubmit = async () => {
        // Validation
        if (!title || !description || !startingPrice || !startTime || !selectedProduct || !quantity) {
            Alert.alert("Missing Information", "Please fill out all fields.");
            return;
        }
        const price = parseFloat(startingPrice);
        const qty = parseInt(quantity, 10);
        if (isNaN(price) || price <= 0) {
            Alert.alert("Invalid Price", "Starting price must be a positive number.");
            return;
        }
        if (isNaN(qty) || qty <= 0 || qty > selectedProduct.quantity) {
            Alert.alert("Invalid Quantity", `Quantity must be between 1 and ${selectedProduct.quantity}.`);
            return;
        }

        // Chuyển đổi thời gian sang định dạng ISO 8601 UTC
        const startTimeISO = startTime.toISOString();

        setIsSubmitting(true);
        try {
            // 1. Tạo phiên đấu giá mới
            await newAuction({
                title: title,
                description: description,
                start_time: startTimeISO
            });

            // 2. Lấy danh sách auction của mình để tìm ID của phiên vừa tạo
            const myListRes = await fetchMyAuctionList();
            if (!myListRes.success || !Array.isArray(myListRes.data) || myListRes.data.length === 0) {
                throw new Error("Could not verify new auction creation.");
            }
            // Lấy item cuối cùng trong danh sách (là item mới nhất)
            const newAuctionSession = myListRes.data[myListRes.data.length - 1];
            const auctionSessionId = newAuctionSession._id;

            if (!auctionSessionId) throw new Error("Auction session ID not found after creation.");

            // 3. Gán sản phẩm vào phiên đấu giá vừa tạo
            await productOfAuction({
                product_id: selectedProduct.productId,
                auction_session_id: auctionSessionId,
                quantity: parseInt(quantity, 10),
                starting_price: parseFloat(startingPrice)
            });

            Alert.alert("Success", "Your auction has been created and is pending approval.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error: any) {
            Alert.alert("Error", error.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // CẬP NHẬT: Handlers cho Date Picker
    const onChangeDateTime = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || startTime;
        setShowPicker(Platform.OS === 'ios');
        setStartTime(currentDate);
    };

    const showMode = (currentMode: 'date' | 'time') => {
        setShowPicker(true);
        setPickerMode(currentMode);
    };

    if (loading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#d9534f" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={60}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.title}>Create New Auction</Text>

                    <Text style={styles.label}>Auction Title</Text>
                    <TextInput style={styles.input} placeholder="e.g., Rare Tokyo Ghoul Card" value={title} onChangeText={setTitle} />

                    <Text style={styles.label}>Product to Auction</Text>
                    <ProductSelector
                        selectedProduct={selectedProduct}
                        onSelect={() => setModalVisible(true)}
                        disabled={isSubmitting}
                    />

                    {selectedProduct && (
                        <>
                            <Text style={styles.label}>Quantity (Max: {selectedProduct.quantity})</Text>
                            <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
                        </>
                    )}

                    <Text style={styles.label}>Description</Text>
                    <TextInput style={[styles.input, styles.textArea]} placeholder="Describe your item..." value={description} onChangeText={setDescription} multiline />

                    <Text style={styles.label}>Starting Price (VND)</Text>
                    <TextInput style={styles.input} placeholder="e.g., 50000" value={startingPrice} onChangeText={setStartingPrice} keyboardType="numeric" />

                    <Text style={styles.label}>Start Time</Text>
                    <View style={styles.dateTimePickerContainer}>
                        <TouchableOpacity style={styles.dateTimePickerButton} onPress={() => showMode('date')}>
                            <Text style={styles.dateTimePickerText}>{startTime.toLocaleDateString('vi-VN')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dateTimePickerButton} onPress={() => showMode('time')}>
                            <Text style={styles.dateTimePickerText}>{startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    </View>

                    {showPicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={startTime}
                            mode={pickerMode}
                            is24Hour={true}
                            display="default"
                            onChange={onChangeDateTime}
                            minimumDate={new Date()}
                        />
                    )}

                    <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.disabledButton]} onPress={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Create Auction</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            <ProductSelectionModal
                visible={isModalVisible}
                products={myProducts}
                onClose={() => setModalVisible(false)}
                onSelect={(product) => {
                    setSelectedProduct(product);
                    setModalVisible(false);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContainer: { padding: 20 },
    title: {
        fontSize: 28,
        fontFamily: 'Oxanium-Bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontFamily: 'Oxanium-SemiBold',
        marginBottom: 8,
        color: '#555',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        fontFamily: 'Oxanium-Regular',
        marginBottom: 16,
        justifyContent: 'center',
    },
    disabledInput: {
        backgroundColor: '#e9ecef',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#d9534f',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Oxanium-Bold',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    placeholderText: {
        color: '#aaa',
        fontFamily: 'Oxanium-Regular',
        fontSize: 16,
    },
    productSelectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productSelectorImage: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    productSelectorText: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 16,
        flex: 1, // Để chữ không bị tràn
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        maxHeight: '60%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Oxanium-Bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    quantityText: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 12,
        color: '#888',
    },
    // Styles cho Date Time Picker
    dateTimePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dateTimePickerButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        width: '48%',
        alignItems: 'center',
    },
    dateTimePickerText: {
        fontSize: 16,
        fontFamily: 'Oxanium-Regular',
    },
});
