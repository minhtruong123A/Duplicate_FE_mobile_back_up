// src/screens/ProductShop.tsx

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { ShopTopTabScreenProps } from '../types/types';
import { fakeProductData, ProductCard, Rarity } from '../data/productData';
import FilterBar from '../components/FilterBar';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 12;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

const collections = ['All Collections', ...Array.from(new Set(fakeProductData.map(item => item.collection)))];
const rarities = ['All Rarities', ...Array.from(new Set(fakeProductData.map(item => item.rateName)))];
const priceFilters = ['Price (Low to High)', 'Price (High to Low)'];

const getRarityColor = (rarity: Rarity) => {
  switch (rarity) {
    case 'Legendary': return '#FFD700';
    case 'Epic': return '#A020F0';
    case 'Rare': return '#1E90FF';
    case 'Uncommon': return '#32CD32';
    case 'Common': return '#A9A9A9';
    default: return '#000';
  }
};

export default function ProductShop({ navigation }: ShopTopTabScreenProps<'Collection Store'>) {
  const [activeCollection, setActiveCollection] = useState('All Collections');
  const [activeRarity, setActiveRarity] = useState('All Rarities');
  const [activePriceSort, setActivePriceSort] = useState<string | null>(null);

  // SỬA LỖI: Thêm state để quản lý nút filter nào đang được chọn (để hiển thị màu)
  const [activeFilter, setActiveFilter] = useState<string>('All Collections');

  const filteredAndSortedData = useMemo(() => {
    let data = [...fakeProductData];

    if (activeCollection !== 'All Collections') {
      data = data.filter(item => item.collection === activeCollection);
    }
    if (activeRarity !== 'All Rarities') {
      data = data.filter(item => item.rateName === activeRarity);
    }
    if (activePriceSort === 'Price (Low to High)') {
      data.sort((a, b) => a.price - b.price);
    } else if (activePriceSort === 'Price (High to Low)') {
      data.sort((a, b) => b.price - a.price);
    }

    return data;
  }, [activeCollection, activeRarity, activePriceSort]);

  const handleFilterSelect = (filter: string) => {
    // Cập nhật state hiển thị ngay lập tức
    setActiveFilter(filter);

    // Cập nhật state logic lọc và reset các filter khác
    if (collections.includes(filter)) {
      setActiveCollection(filter);
      setActiveRarity('All Rarities');
      setActivePriceSort(null);
    } else if (rarities.includes(filter)) {
      setActiveRarity(filter);
      setActiveCollection('All Collections');
      setActivePriceSort(null);
    } else if (priceFilters.includes(filter)) {
      setActivePriceSort(filter);
      setActiveCollection('All Collections');
      setActiveRarity('All Rarities');
    }
  };

  const renderProductItem = ({ item }: { item: ProductCard }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('Collection Detail', { productId: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={[styles.itemRarity, { color: getRarityColor(item.rateName) }]}>
          {item.rateName}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price.toLocaleString('vi-VN')} đ
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FilterBar
        filters={[...collections, ...rarities, ...priceFilters]}
        onSelectFilter={handleFilterSelect}
        // SỬA LỖI: Truyền state activeFilter vào component
        activeFilter={activeFilter}
      />
      <FlatList
        data={filteredAndSortedData}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  listContent: {
    paddingHorizontal: ITEM_MARGIN / 2,
    paddingTop: 0,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginTop: 16,
    marginHorizontal: ITEM_MARGIN / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: ITEM_WIDTH * 1.4,
    backgroundColor: '#eee',
  },
  itemInfo: {
    padding: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Oxanium-SemiBold',
    height: 40,
  },
  itemRarity: {
    fontSize: 14,
    fontFamily: 'Oxanium-Bold',
    marginVertical: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#d9534f',
    fontFamily: 'Oxanium-Bold',
  },
});
