// src/screens/FavoriteBoxes.tsx

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { fakeBoxData, MysteryBox } from '../data/boxData';
import { ShoppingCartTopTabScreenProps } from '../types/types';

// --- Components ---
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
// ------------------

export default function FavoriteBoxes({ navigation }: ShoppingCartTopTabScreenProps<'Favorite Boxes'>) {
  const [boxes, setBoxes] = useState<MysteryBox[]>(fakeBoxData);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  const handleToggleSelection = (id: string) => {
    const newSelectedItems = new Map(selectedItems);
    if (newSelectedItems.has(id)) {
      newSelectedItems.delete(id);
    } else {
      newSelectedItems.set(id, 1);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleToggleSelection(id);
      return;
    }
    // Giả sử mỗi box chỉ có thể mua 10 cái
    if (newQuantity > 10) {
      Alert.alert("Notification", "You can only purchase up to 10 boxes.");
      return;
    }
    const newSelectedItems = new Map(selectedItems);
    newSelectedItems.set(id, newQuantity);
    setSelectedItems(newSelectedItems);
  };

  const handleToggleSelectAll = () => {
    if (selectedItems.size === boxes.length) {
      setSelectedItems(new Map());
    } else {
      const allSelected = new Map(boxes.map(b => [b.id, 1]));
      setSelectedItems(allSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete ${selectedItems.size} selected boxes?`,
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: 'destructive',
          onPress: () => {
            setBoxes(prev => prev.filter(b => !selectedItems.has(b.id)));
            setSelectedItems(new Map());
          },
        },
      ]
    );
  };

  const totalAmount = useMemo(() => {
    let total = 0;
    selectedItems.forEach((quantity, id) => {
      const box = boxes.find(b => b.id === id);
      if (box) {
        total += box.price * quantity;
      }
    });
    return total;
  }, [selectedItems, boxes]);

  const renderItem = ({ item }: { item: MysteryBox }) => {
    const isSelected = selectedItems.has(item.id);
    const quantity = selectedItems.get(item.id) || 0;

    return (
      <View style={styles.itemContainer}>
        <Checkbox
          isChecked={isSelected}
          onPress={() => handleToggleSelection(item.id)}
        />
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
        </View>
        {isSelected && (
          <QuantitySelector
            quantity={quantity}
            onDecrease={() => handleQuantityChange(item.id, quantity - 1)}
            onIncrease={() => handleQuantityChange(item.id, quantity + 1)}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={boxes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No favorite boxes yet.</Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <View style={styles.footerTopRow}>
          <View style={styles.selectAllContainer}>
            <Checkbox
              isChecked={boxes.length > 0 && selectedItems.size === boxes.length}
              onPress={handleToggleSelectAll}
            />
            <Text style={styles.selectAllText}>All ({selectedItems.size})</Text>
          </View>
          <TouchableOpacity onPress={handleDeleteSelected}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerBottomRow}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>{totalAmount.toLocaleString('vi-VN')} đ</Text>
          </View>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Buy now</Text>
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
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
});
