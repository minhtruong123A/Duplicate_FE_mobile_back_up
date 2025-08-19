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
import { Ionicons } from '@expo/vector-icons'; // THÊM MỚI
import AsyncStorage from '@react-native-async-storage/async-storage'; // THÊM MỚI
import { useAuth } from '../context/AuthContext'; // THÊM MỚI

// --- Types, APIs, Components ---
import { CartBoxItem } from '../types/types';
import { removeFromCart, clearAllCart } from '../services/api.cart'; // API riêng cho box
import { buyMysteryBox } from '../services/api.mysterybox'
import ApiImage from '../components/ApiImage';
import CartIcon from '../../assets/icons/cart_outline.svg';

// --- Components (Không đổi) ---
const Checkbox = ({ isChecked, onPress }: { isChecked: boolean, onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.checkboxBase, isChecked && styles.checkboxChecked]}>
    {isChecked && <Text style={styles.checkmark}>✓</Text>}
  </TouchableOpacity>
);

const QuantitySelector = ({ quantity, onDecrease, onIncrease }: { quantity: number, onDecrease: () => void, onIncrease: () => void }) => (
  <View style={styles.quantityContainer}>
    <TouchableOpacity onPress={onDecrease} style={styles.quantityButton}>
      <Text style={styles.quantityButtonText}>-</Text>
    </TouchableOpacity>
    <Text style={styles.quantityText}>{quantity}</Text>
    <TouchableOpacity onPress={onIncrease} style={styles.quantityButton}>
      <Text style={styles.quantityButtonText}>+</Text>
    </TouchableOpacity>
  </View>
);

// --- Màn hình chính ---
export default function FavoriteBoxes({ boxes, refreshCart }: { boxes: CartBoxItem[], refreshCart: () => void }) {
  // --- State Management ---
  const [cartBoxes, setCartBoxes] = useState(boxes);
  const { isAuctionJoined } = useAuth();
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  // THÊM MỚI: State và logic cho "Yêu thích"
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // useEffect để đồng bộ dữ liệu từ props vào state
  useEffect(() => {
    setCartBoxes(boxes);

    // CẬP NHẬT: Load và dọn dẹp danh sách yêu thích
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('favorite_boxes'); // Key khác
        if (stored) {
          const favsFromStorage: string[] = JSON.parse(stored);
          const validFavs = favsFromStorage.filter(id =>
            boxes.some(b => b.mangaBoxId === id)
          );
          setFavoriteIds(new Set(validFavs));
          if (validFavs.length !== favsFromStorage.length) {
            await AsyncStorage.setItem('favorite_boxes', JSON.stringify(validFavs));
          }
        }
      } catch (e) {
        console.log('Error loading favorite boxes', e);
      }
    };
    loadFavorites();

    const newSelected = new Map(selectedItems);
    let selectionChanged = false;
    for (const id of newSelected.keys()) {
      if (!boxes.some(b => b.mangaBoxId === id)) {
        newSelected.delete(id);
        selectionChanged = true;
      }
    }
    if (selectionChanged) {
      setSelectedItems(newSelected);
    }
  }, [boxes]);

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
    () => cartBoxes.filter(item => !favoriteIds.has(item.mangaBoxId)),
    [cartBoxes, favoriteIds]
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
    await AsyncStorage.setItem('favorite_boxes', JSON.stringify(Array.from(newFavs)));
  };


  const handleToggleSelection = (item: CartBoxItem) => {
    if (favoriteIds.has(item.mangaBoxId)) return;

    const newSelected = new Map(selectedItems);
    if (newSelected.has(item.mangaBoxId)) {
      newSelected.delete(item.mangaBoxId);
    } else {
      // Khi chọn, lấy số lượng hiện tại là 1 (hoặc item.quantity nếu API trả về)
      newSelected.set(item.mangaBoxId, 1);
    }
    setSelectedItems(newSelected);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    // Nếu giảm số lượng xuống dưới 1 -> Hỏi để xóa
    if (newQuantity < 1) {
      Alert.alert(
        "Remove Item", "Do you want to remove this box from your cart?",
        [
          { text: "Cancel", style: 'cancel' },
          {
            text: "Yes", style: 'destructive', onPress: async () => {
              await removeFromCart({ sellProductId: "", mangaBoxId: id });
              refreshCart();
            }
          },
        ]
      );
      return;
    }
    // Giới hạn số lượng mua tối đa
    if (newQuantity > 10) {
      Alert.alert("Notification", "You can only purchase up to 10 boxes of the same type.");
      return;
    }

    // Với Box, chỉ cần cập nhật số lượng ở local state để checkout
    const newSelected = new Map(selectedItems);
    newSelected.set(id, newQuantity);
    setSelectedItems(newSelected);
  };

  const handleDeleteSelected = () => {
    const idsToDelete = Array.from(selectedItems.keys());
    if (idsToDelete.length === 0) return;

    Alert.alert(
      "Confirm Deletion", `Are you sure you want to remove ${idsToDelete.length} item(s) from your cart?`,
      [{ text: "Cancel" }, {
        text: "Delete",
        style: 'destructive',
        onPress: async () => {
          if (selectedItems.size === cartBoxes.length) {
            await clearAllCart('box');
          } else {
            await Promise.all(idsToDelete.map(id => removeFromCart({ sellProductId: "", mangaBoxId: id })));
          }
          refreshCart();
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
    // Dùng Promise.allSettled để không bị dừng lại khi có lỗi
    await Promise.allSettled(
      itemsToBuy.map(([mangaBoxId, quantity]) => buyMysteryBox({ mangaBoxId, quantity }))
    );
    setIsCheckingOut(false);

    // Sau khi checkout, thông báo và làm mới giỏ hàng
    Alert.alert("Checkout Complete", "Thank you for your purchase! Check your collection for new items.");
    refreshCart();
  };

  const handleToggleSelectAll = () => {
    if (selectedItems.size === selectableCount && selectableCount > 0) {
      setSelectedItems(new Map());
    } else {
      const allSelected = new Map(selectableItems.map(p => [p.mangaBoxId, p.quantity]));
      setSelectedItems(allSelected);
    }
  };

  // --- TÍNH TOÁN ĐỂ HIỂN THỊ ---
  const totalAmount = useMemo(() => {
    let total = 0;
    selectedItems.forEach((quantity, id) => {
      const item = cartBoxes.find(b => b.mangaBoxId === id);
      if (item) {
        total += item.box.mysteryBoxPrice * quantity;
      }
    });
    return total;
  }, [selectedItems, cartBoxes]);

  // --- RENDER ---
  const renderItem = ({ item }: { item: CartBoxItem }) => {
    const isSelected = selectedItems.has(item.mangaBoxId);
    const quantity = selectedItems.get(item.mangaBoxId) || 1;
    // THÊM MỚI: Kiểm tra item có được yêu thích không
    const isFavorited = favoriteIds.has(item.mangaBoxId);

    return (
      <View style={styles.itemContainer}>
        {/* CẬP NHẬT: Thêm lại icon trái tim */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.mangaBoxId)}
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
        <ApiImage urlPath={item.box.urlImage} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.box.mysteryBoxName}</Text>
          <Text style={styles.itemPrice}>{item.box.mysteryBoxPrice.toLocaleString('vi-VN')} VND</Text>
        </View>
        {isSelected && !isFavorited && (
          <QuantitySelector
            quantity={quantity}
            onDecrease={() => handleQuantityChange(item.mangaBoxId, quantity - 1)}
            onIncrease={() => handleQuantityChange(item.mangaBoxId, quantity + 1)}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cartBoxes}
        renderItem={renderItem}
        keyExtractor={(item) => item.mangaBoxId}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CartIcon width={150} height={150} color="#cccccc" />
            <Text>Your cart is empty.</Text>
          </View>}
      />
      <View style={styles.footer}>
        <View style={styles.footerTopRow}>
          {/* <View style={styles.selectAllContainer}>
            <Checkbox
              isChecked={cartBoxes.length > 0 && selectedItems.size === cartBoxes.length}
              onPress={handleToggleSelectAll}
            />
            <Text style={styles.selectAllText}>All ({selectedItems.size})</Text>
          </View> */}
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
            <Text style={styles.totalAmount}>{totalAmount.toLocaleString('vi-VN')} VND</Text>
          </View>
          <TouchableOpacity
            style={[styles.buyButton, (isCheckingOut || isAuctionJoined) && styles.disabledButton]}
            onPress={handleCheckout}
            disabled={isCheckingOut || isAuctionJoined}
          >
            {isCheckingOut ? <ActivityIndicator color="#fff" /> : <Text style={styles.buyButtonText}>Checkout</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Copy styles từ FavoriteProducts.tsx vì chúng giống hệt nhau
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  listContent: { paddingBottom: 140 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
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
  favoriteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
    padding: 4,
  },
});
