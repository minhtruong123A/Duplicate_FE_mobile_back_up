import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { ShopTopTabScreenProps } from '../types/types';
import FilterBar from '../components/FilterBar';
import { getAllProductsOnSale, getAllSuggestionProductsOnSale } from '../services/api.product'; // Import API sản phẩm
import { ProductOnSaleItem } from '../types/types';
import ProductItem from '../components/ProductItem'; // Ta sẽ tạo component này
import { useFocusEffect } from '@react-navigation/native'; // Thêm useFocusEffect

const priceFilters = ['Price (Low to High)', 'Price (High to Low)'];
const rarityFilters = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
const mainFilters = ['All', 'Suggestions'];

export default function CollectionStore({ navigation }: ShopTopTabScreenProps<'Collection Store'>) {
  // CẬP NHẬT: State để lưu 2 nguồn dữ liệu riêng biệt
  const [allProducts, setAllProducts] = useState<ProductOnSaleItem[]>([]);
  const [suggestionProducts, setSuggestionProducts] = useState<ProductOnSaleItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CẬP NHẬT: State cho các bộ lọc
  const [activeMainFilter, setActiveMainFilter] = useState<'All' | 'Suggestions'>('All');
  const [activeTopic, setActiveTopic] = useState('All');
  const [activePriceSort, setActivePriceSort] = useState<string | null>(null);
  const [activeRarity, setActiveRarity] = useState('All');

  const fetchAllData = useCallback(async () => {
    // Chỉ hiện loading toàn màn hình lần đầu
    if (allProducts.length === 0) setLoading(true);
    try {
      // Gọi cả 2 API cùng lúc để tối ưu
      const [allRes, suggestionRes] = await Promise.all([
        getAllProductsOnSale(),
        getAllSuggestionProductsOnSale()
      ]);

      if (allRes.status && Array.isArray(allRes.data)) {
        setAllProducts(allRes.data.filter((p: any) => p.quantity > 0 && p.isSell));
      }
      if (suggestionRes.status && Array.isArray(suggestionRes.data)) {
        setSuggestionProducts(suggestionRes.data.filter((p: any) => p.quantity > 0 && p.isSell));
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Code đã sửa
  useFocusEffect(
    useCallback(() => {
      fetchAllData(); // Gọi hàm async bên trong một hàm sync
    }, [fetchAllData])
  );

  // CẬP NHẬT: Chọn nguồn dữ liệu dựa trên filter chính
  const sourceData = useMemo(() => {
    return activeMainFilter === 'All' ? allProducts : suggestionProducts;
  }, [activeMainFilter, allProducts, suggestionProducts]);

  const topics = useMemo(() => {
    const uniqueTopics = new Set(sourceData.map(item => item.topic));
    return ['All', ...Array.from(uniqueTopics)];
  }, [sourceData]);

  const handleFilterSelect = (filter: string) => {
    if (mainFilters.includes(filter)) {
      setActiveMainFilter(filter as 'All' | 'Suggestions');
      // Reset các filter phụ khi đổi nguồn dữ liệu
      setActiveTopic('All');
      setActiveRarity('All');
    } else if (topics.includes(filter)) {
      setActiveTopic(filter);
    } else if (rarityFilters.includes(filter)) {
      setActiveRarity(filter);
    } else if (priceFilters.includes(filter)) {
      setActivePriceSort(filter);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let data = [...sourceData];
    if (activeTopic !== 'All') {
      data = data.filter(item => item.topic === activeTopic);
    }
    if (activeRarity !== 'All') {
      data = data.filter(item => item.rarityName.toLowerCase() === activeRarity.toLowerCase());
    }
    if (activePriceSort === 'Price (Low to High)') {
      data.sort((a, b) => a.price - b.price);
    } else if (activePriceSort === 'Price (High to Low)') {
      data.sort((a, b) => b.price - a.price);
    }
    return data;
  }, [sourceData, activeTopic, activeRarity, activePriceSort]);

  const renderProductItem = ({ item }: { item: ProductOnSaleItem }) => (
    <ProductItem
      item={item}
      // Truyền prop isNew nếu đang ở tab "Suggestions"
      isNew={activeMainFilter === 'Suggestions'}
      onPress={() => navigation.navigate('Collection Detail', { productId: item.id })}
    />
  );

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#d9534f" /></View>;
  }

  if (error) {
    return <View style={styles.centerContainer}><Text style={styles.errorText}>Error: {error}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FilterBar
        filters={[...mainFilters, ...topics.slice(1), ...rarityFilters.slice(1), ...priceFilters]}
        onSelectFilter={handleFilterSelect}
        activeFilter={activeMainFilter !== 'All' ? activeMainFilter : activeTopic !== 'All' ? activeTopic : activeRarity !== 'All' ? activeRarity : activePriceSort}
      />
      <FlatList
        data={filteredAndSortedData}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
  errorText: { fontSize: 16, color: 'red', fontFamily: 'Oxanium-Regular' },
  listContent: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 32 },
  columnWrapper: { justifyContent: 'space-between' },
});