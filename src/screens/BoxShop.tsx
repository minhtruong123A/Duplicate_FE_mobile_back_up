// src/screens/BoxShop.tsx

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ShopTopTabScreenProps } from '../types/types';
import { fakeBoxData, MysteryBox } from '../data/boxData';
import FilterBar from '../components/FilterBar'; // Import component mới

// Lấy danh sách collection duy nhất từ data
const collections = ['All', ...Array.from(new Set(fakeBoxData.map(item => item.collection)))];
const priceFilters = ['Price (Low to High)', 'Price (High to Low)'];

export default function BoxShop({ navigation }: ShopTopTabScreenProps<'Mystery Box'>) {
  const [activeCollection, setActiveCollection] = useState('All');
  const [activePriceSort, setActivePriceSort] = useState<string | null>(null);

  const handleFilterSelect = (filter: string) => {
    if (collections.includes(filter)) {
      setActiveCollection(filter);
    } else if (priceFilters.includes(filter)) {
      setActivePriceSort(filter);
    } else { // Reset
      setActiveCollection('All');
      setActivePriceSort(null);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let data = [...fakeBoxData];

    // Lọc theo collection
    if (activeCollection !== 'All') {
      data = data.filter(item => item.collection === activeCollection);
    }

    // Sắp xếp theo giá
    if (activePriceSort === 'Price (Low to High)') {
      data.sort((a, b) => a.price - b.price);
    } else if (activePriceSort === 'Price (High to Low)') {
      data.sort((a, b) => b.price - a.price);
    }

    return data;
  }, [activeCollection, activePriceSort]);

  const renderBoxItem = ({ item }: { item: MysteryBox }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('Box Detail', { boxId: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCollection}>Collection: {item.collection}</Text>
        <Text style={styles.itemPrice}>
          {item.price.toLocaleString('vi-VN')} đ
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FilterBar
        filters={[...collections, ...priceFilters]}
        onSelectFilter={handleFilterSelect}
        activeFilter={activeCollection !== 'All' ? activeCollection : activePriceSort}
      />
      <FlatList
        data={filteredAndSortedData}
        renderItem={renderBoxItem}
        keyExtractor={(item) => item.id}
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
    paddingHorizontal: 16,
    paddingTop: 0, // Bỏ padding top vì đã có filter bar
    paddingBottom: 32,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Oxanium-Bold',
  },
  itemCollection: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
    fontFamily: 'Oxanium-Regular',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d9534f',
    fontFamily: 'Oxanium-SemiBold',
  },
});
