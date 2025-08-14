import React, { useState, useMemo, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // THÊM MỚI
import AsyncStorage from '@react-native-async-storage/async-storage'; // THÊM MỚI

// --- Types, APIs, Components ---
import { RootStackNavigationProp, CartProductItem } from '../types/types';
import { updateCartQuantity, removeFromCart, clearAllCart } from '../services/api.cart';
import { buyProductOnSale } from '../services/api.product';
import ApiImage from '../components/ApiImage';


// --- Components (Không đổi) ---
const Checkbox = ({ isChecked, onPress }: { isChecked: boolean, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={[styles.checkboxBase, isChecked && styles.checkboxChecked]}>
        {isChecked && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
);

const QuantitySelector = ({ quantity, onDecrease, onIncrease, maxQuantity }: { quantity: number, onDecrease: () => void, onIncrease: () => void, maxQuantity: number }) => (
    <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={onDecrease} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity onPress={onIncrease} disabled={quantity >= maxQuantity} style={styles.quantityButton}>
            <Text style={[styles.quantityButtonText, quantity >= maxQuantity && styles.disabledText]}>+</Text>
        </TouchableOpacity>
    </View>
);

// --- Màn hình chính ---
export default function FavoriteProducts({ products, refreshCart }: { products: CartProductItem[], refreshCart: () => void }) {
    const navigation = useNavigation<RootStackNavigationProp>();

    // State nội bộ của component
    const [cartProducts, setCartProducts] = useState(products);
    const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    // THÊM MỚI: State và logic cho "Yêu thích"
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    // useEffect để đồng bộ dữ liệu từ props vào state mỗi khi giỏ hàng được làm mới
    useEffect(() => {
        setCartProducts(products);

        // CẬP NHẬT: Load và dọn dẹp danh sách yêu thích mỗi khi giỏ hàng thay đổi
        const loadFavorites = async () => {
            try {
                const stored = await AsyncStorage.getItem('favorite_products');
                if (stored) {
                    const favsFromStorage: string[] = JSON.parse(stored);
                    // Lọc ra các ID yêu thích vẫn còn tồn tại trong giỏ hàng
                    const validFavs = favsFromStorage.filter(id =>
                        products.some(p => p.sellProductId === id)
                    );
                    setFavoriteIds(new Set(validFavs));

                    if (validFavs.length !== favsFromStorage.length) {
                        await AsyncStorage.setItem('favorite_products', JSON.stringify(validFavs));
                    }
                }
            } catch (e) {
                console.log('Error loading favorite products', e);
            }
        };

        loadFavorites();

        // Dọn dẹp những item đã chọn nhưng không còn trong giỏ hàng
        const newSelected = new Map(selectedItems);
        let selectionChanged = false;
        for (const id of newSelected.keys()) {
            if (!products.some(p => p.sellProductId === id)) {
                newSelected.delete(id);
                selectionChanged = true;
            }
        }
        if (selectionChanged) {
            setSelectedItems(newSelected);
        }
    }, [products]);

    useEffect(() => {
        if (favoriteIds.size === 0 || selectedItems.size === 0) return;
        const newSelected = new Map(selectedItems);
        let changed = false;
        for (const id of Array.from(newSelected.keys())) {
            if (favoriteIds.has(id)) {
                newSelected.delete(id);
                changed = true;
            }
        }
        if (changed) setSelectedItems(newSelected);
    }, [favoriteIds]);

    const selectableItems = useMemo(
        () => cartProducts.filter(item => !favoriteIds.has(item.sellProductId)),
        [cartProducts, favoriteIds]
    );

    const selectableCount = selectableItems.length;
    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

    // THÊM MỚI: Hàm xử lý toggle yêu thích
    const toggleFavorite = async (id: string) => {
        const newFavs = new Set(favoriteIds);
        if (newFavs.has(id)) {
            newFavs.delete(id);
        } else {
            newFavs.add(id);
        }
        setFavoriteIds(newFavs);
        await AsyncStorage.setItem('favorite_products', JSON.stringify(Array.from(newFavs)));
    };

    const handleToggleSelection = (item: CartProductItem) => {
        if (favoriteIds.has(item.sellProductId)) return;

        const newSelected = new Map(selectedItems);
        if (newSelected.has(item.sellProductId)) {
            newSelected.delete(item.sellProductId);
        } else {
            // Khi chọn, lấy số lượng hiện tại trong giỏ hàng
            newSelected.set(item.sellProductId, item.quantity);
        }
        setSelectedItems(newSelected);
    };

    const handleQuantityChange = async (id: string, newQuantity: number) => {
        const itemIndex = cartProducts.findIndex(p => p.sellProductId === id);
        if (itemIndex === -1) return;

        // Nếu giảm số lượng xuống dưới 1 -> Hỏi để xóa
        if (newQuantity < 1) {
            Alert.alert(
                "Remove Item", "Do you want to remove this item from your cart?",
                [
                    { text: "Cancel", style: 'cancel' },
                    {
                        text: "Yes", style: 'destructive', onPress: async () => {
                            await removeFromCart({ sellProductId: id, mangaBoxId: "" });
                            refreshCart(); // Tải lại giỏ hàng
                        }
                    },
                ]
            );
            return;
        }

        // 1. Lưu lại trạng thái hiện tại để có thể rollback nếu API lỗi
        const originalProducts = [...cartProducts];
        const originalSelectedItems = new Map(selectedItems);

        // 2. Cập nhật giao diện ngay lập tức (Cập nhật lạc quan)
        const newOptimisticProducts = originalProducts.map((p, index) =>
            index === itemIndex ? { ...p, quantity: newQuantity } : p
        );
        setCartProducts(newOptimisticProducts); // Cập nhật danh sách chính

        // Cập nhật cả danh sách đang chọn
        if (selectedItems.has(id)) {
            const newSelected = new Map(selectedItems);
            newSelected.set(id, newQuantity);
            setSelectedItems(newSelected);
        }

        // Gọi API để cập nhật số lượng
        try {
            const response = await updateCartQuantity({ Id: id, quantity: newQuantity });

            // Nếu API trả về lỗi logic (status: false) -> Ném lỗi để rollback
            if (!response.status) {
                throw new Error(response.error || "Failed to update quantity on server.");
            }
            // Nếu API thành công, không cần làm gì cả. Giao diện đã đúng.
        } catch (error: any) {
            // 4. NẾU API THẤT BẠI: Hoàn tác lại trạng thái giao diện
            Alert.alert("Error", error.message || "Could not update quantity. Please try again.");
            setCartProducts(originalProducts); // Quay về trạng thái cũ
            setSelectedItems(originalSelectedItems); // Quay về trạng thái cũ        }
        }
    };

    const handleDeleteSelected = () => {
        const idsToDelete = Array.from(selectedItems.keys());
        if (idsToDelete.length === 0) return;

        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to remove ${idsToDelete.length} item(s) from your cart?`,
            [{ text: "Cancel" }, {
                text: "Delete",
                style: 'destructive',
                onPress: async () => {
                    // Nếu chọn tất cả -> gọi API xóa tất cả cho hiệu quả
                    if (selectedItems.size === cartProducts.length) {
                        await clearAllCart('product');
                    } else {
                        // Xóa từng item đã chọn
                        await Promise.all(idsToDelete.map(id => removeFromCart({ sellProductId: id, mangaBoxId: "" })));
                    }
                    refreshCart(); // Tải lại giỏ hàng
                }
            }]
        );
    };

    const handleCheckout = async () => {
        const itemsToBuy = Array.from(selectedItems.entries());
        if (itemsToBuy.length === 0) {
            Alert.alert("No items selected", "Please select items to checkout.");
            return;
        }

        setIsCheckingOut(true);
        // Dùng Promise.allSettled để thực hiện tất cả các lệnh mua, dù có lỗi hay không
        const results = await Promise.allSettled(
            itemsToBuy.map(([sellProductId, quantity]) => buyProductOnSale({ sellProductId, quantity }))
        );

        let outOfStockErrorOccurred = false;
        results.forEach(result => {
            if (result.status === 'rejected') {
                const errorMsg = result.reason?.error?.toLowerCase() || '';
                // Kiểm tra thông báo lỗi đặc biệt
                if (errorMsg.includes("out of stock or no longer available")) {
                    outOfStockErrorOccurred = true;
                }
            }
        });

        setIsCheckingOut(false);

        if (outOfStockErrorOccurred) {
            Alert.alert(
                "Stock has changed",
                "The quantity of some items has changed or they are no longer for sale. Would you like to refresh your cart?",
                [
                    { text: "Cancel", style: 'cancel' }, // "Để kỉ niệm"
                    { text: "OK", onPress: refreshCart },
                ]
            );
        } else {
            Alert.alert("Checkout Complete", "Thank you for your purchase!");
            refreshCart(); // Tải lại giỏ hàng để xóa các sản phẩm đã mua
        }
    };

    const handleToggleSelectAll = () => {
        if (selectedItems.size === selectableCount && selectableCount > 0) {
            setSelectedItems(new Map());
        } else {
            const allSelected = new Map(selectableItems.map(p => [p.sellProductId, p.quantity]));
            setSelectedItems(allSelected);
        }
    };

    // --- TÍNH TOÁN ĐỂ HIỂN THỊ ---
    const totalAmount = useMemo(() => {
        let total = 0;
        selectedItems.forEach((quantity, id) => {
            const item = cartProducts.find(p => p.sellProductId === id);
            if (item) {
                total += item.product.price * quantity;
            }
        });
        return total;
    }, [selectedItems, cartProducts]);

    // --- RENDER ---
    const renderItem = ({ item }: { item: CartProductItem }) => {
        const isSelected = selectedItems.has(item.sellProductId);
        // Lấy số lượng từ state giỏ hàng (API), không phải từ state lựa chọn
        const displayQuantity = item.quantity;
        // THÊM MỚI: Kiểm tra xem item có trong danh sách yêu thích không
        const isFavorited = favoriteIds.has(item.sellProductId);

        return (
            <View style={styles.itemContainer}>
                {/* CẬP NHẬT: Thêm lại icon trái tim */}
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(item.sellProductId)}
                >
                    <Ionicons
                        name={isFavorited ? 'heart' : 'heart-outline'}
                        size={22}
                        color={isFavorited ? '#d9534f' : 'gray'}
                    />
                </TouchableOpacity>

                {/* CẬP NHẬT: Ẩn checkbox nếu item đã được yêu thích */}
                {!isFavorited && (
                    <Checkbox
                        isChecked={isSelected}
                        onPress={() => handleToggleSelection(item)}
                    />
                )}
                <ApiImage urlPath={item.product.urlImage} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SellerProfile', { sellerId: item.product.userId })}>
                        <Text style={styles.sellerName}>by {item.product.username}</Text>
                    </TouchableOpacity>
                    <Text style={styles.itemPrice}>{item.product.price.toLocaleString('vi-VN')} đ</Text>
                </View>
                {isSelected && !isFavorited && (
                    <QuantitySelector
                        quantity={displayQuantity}
                        onDecrease={() => handleQuantityChange(item.sellProductId, displayQuantity - 1)}
                        onIncrease={() => handleQuantityChange(item.sellProductId, displayQuantity + 1)}
                        maxQuantity={item.product.quantity} // Số lượng tối đa trong kho
                    />
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={cartProducts}
                renderItem={renderItem}
                keyExtractor={(item) => item.sellProductId}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<View style={styles.emptyContainer}><Text>Your cart is empty.</Text></View>}
            />
            <View style={styles.footer}>
                <View style={styles.footerTopRow}>
                    {selectableCount > 0 ? (
                        <View style={styles.selectAllContainer}>
                            <Checkbox
                                isChecked={selectableCount > 0 && selectedItems.size === selectableCount}
                                onPress={handleToggleSelectAll}
                            />
                            <Text style={styles.selectAllText}>All ({selectableCount})</Text>
                        </View>
                    ) : (
                        // Nếu không có selectable items (tức tất cả đều favorite) thì ẩn select all và hiển thị một text nhẹ
                        <View style={styles.selectAllContainer}>
                            <Text style={[styles.selectAllText, { color: '#888' }]}></Text>
                        </View>
                    )}
                    <TouchableOpacity onPress={handleDeleteSelected}>
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.footerBottomRow}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalAmount}>{totalAmount.toLocaleString('vi-VN')} đ</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.buyButton, isCheckingOut && styles.disabledButton]}
                        onPress={handleCheckout}
                        disabled={isCheckingOut}
                    >
                        {isCheckingOut ? <ActivityIndicator color="#fff" /> : <Text style={styles.buyButtonText}>Checkout</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    listContent: { paddingBottom: 140 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    checkboxBase: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d9534f',
        backgroundColor: 'transparent',
        marginRight: 12,
    },
    checkboxChecked: { backgroundColor: '#d9534f' },
    checkmark: { color: 'white', fontWeight: 'bold' },
    itemImage: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontFamily: 'Oxanium-SemiBold' },
    itemPrice: { fontSize: 14, fontFamily: 'Oxanium-Regular', color: '#d9534f', marginTop: 4 },
    // Styles for Quantity Selector
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        borderRadius: 8,
    },
    quantityButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    quantityButtonText: {
        fontSize: 18,
        fontFamily: 'Oxanium-Bold',
        color: '#d9534f',
    },
    quantityText: {
        paddingHorizontal: 8,
        fontSize: 16,
        fontFamily: 'Oxanium-Bold',
    },
    // Footer styles
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0',
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 34,
    },
    footerTopRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16,
    },
    footerBottomRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    selectAllContainer: {
        flexDirection: 'row', alignItems: 'center',
    },
    selectAllText: {
        marginLeft: 8, fontFamily: 'Oxanium-Regular', fontSize: 16,
    },
    deleteButtonText: {
        color: '#d9534f', fontFamily: 'Oxanium-Bold', fontSize: 16,
    },
    totalContainer: {
        alignItems: 'flex-start',
    },
    totalLabel: {
        fontSize: 14, fontFamily: 'Oxanium-Regular', color: '#666',
    },
    totalAmount: {
        fontSize: 18, fontFamily: 'Oxanium-Bold', color: '#d9534f',
    },
    buyButton: {
        backgroundColor: '#d9534f', paddingHorizontal: 32, paddingVertical: 12,
        borderRadius: 8,
    },
    buyButtonText: {
        color: '#fff', fontFamily: 'Oxanium-Bold', fontSize: 16,
    },
    disabledButton: { backgroundColor: '#ccc' },
    disabledText: { color: '#ccc' },
    sellerName: {
        fontSize: 12,
        fontFamily: 'Oxanium-Regular',
        color: 'gray',
        marginVertical: 2,
        textDecorationLine: 'underline',
    },
    favoriteButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        zIndex: 1,
        padding: 4,
    },
});
