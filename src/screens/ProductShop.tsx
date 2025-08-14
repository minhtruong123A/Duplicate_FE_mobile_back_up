import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { ShopTopTabScreenProps } from '../types/types';
import FilterBar from '../components/FilterBar';
import { getAllProductsOnSale } from '../services/api.product'; // Import API sản phẩm
import { ProductOnSaleItem } from '../types/types';
import ProductItem from '../components/ProductItem'; // Ta sẽ tạo component này
import { useFocusEffect } from '@react-navigation/native'; // Thêm useFocusEffect

const priceFilters = ['Price (Low to High)', 'Price (High to Low)'];
const rarityFilters = ['All', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];


export default function CollectionStore({ navigation }: ShopTopTabScreenProps<'Collection Store'>) {
  const [products, setProducts] = useState<ProductOnSaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTopic, setActiveTopic] = useState('All');
  const [activePriceSort, setActivePriceSort] = useState<string | null>(null);
  const [activeRarity, setActiveRarity] = useState('All'); // <-- THÊM MỚI

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await getAllProductsOnSale();
  //       if (response.status && Array.isArray(response.data)) {
  //         // LỌC THEO YÊU CẦU: quantity > 0 VÀ isSell = true
  //         const availableProducts = response.data.filter(
  //           (p: ProductOnSaleItem) => p.quantity > 0 && p.isSell
  //         );
  //         setProducts(availableProducts);
  //       } else {
  //         throw new Error('Invalid data format received from API');
  //       }
  //       setError(null);
  //     } catch (err: any) {
  //       setError(err.message || 'Failed to fetch products.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchProducts();
  // }, []);

  const fetchProducts = useCallback(async () => {
    try {
      // Không set loading lại mỗi lần focus để tránh giật UI
      const response = await getAllProductsOnSale();
      if (response.status && Array.isArray(response.data)) {
        // LỌC THEO YÊU CẦU: quantity > 0 VÀ isSell = true
        const availableProducts = response.data.filter(
          (p: ProductOnSaleItem) => p.quantity > 0 && p.isSell
        );
        setProducts(availableProducts);
      } else {
        throw new Error('Invalid data format received from API');
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products.');
    } finally {
      // Chỉ tắt loading lần đầu
      if (loading) setLoading(false);
    }
  }, [loading]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const topics = useMemo(() => {
    const uniqueTopics = new Set(products.map(item => item.topic));
    return ['All', ...Array.from(uniqueTopics)];
  }, [products]);

  const handleFilterSelect = (filter: string) => {
    // Nếu chọn filter topic
    if (topics.includes(filter)) {
      setActiveTopic(filter);
      setActiveRarity('All'); // Reset rarity filter
      // Nếu chọn filter rarity
    } else if (rarityFilters.includes(filter)) {
      setActiveRarity(filter);
      setActiveTopic('All'); // Reset topic filter
      // Nếu chọn sắp xếp giá
    } else if (priceFilters.includes(filter)) {
      setActivePriceSort(filter);
      // Nếu chọn Reset (hoặc một filter không xác định)
    } else {
      setActiveTopic('All');
      setActiveRarity('All');
      setActivePriceSort(null);
    }
  };

  // CẬP NHẬT: `useMemo` để thêm logic lọc theo rarity
  const filteredAndSortedData = useMemo(() => {
    let data = [...products];

    // 1. Lọc theo topic
    if (activeTopic !== 'All') {
      data = data.filter(item => item.topic === activeTopic);
    }

    // 2. Lọc theo rarity
    if (activeRarity !== 'All') {
      // So sánh không phân biệt chữ hoa/thường
      data = data.filter(item => item.rarityName.toLowerCase() === activeRarity.toLowerCase());
    }

    // 3. Sắp xếp theo giá
    if (activePriceSort === 'Price (Low to High)') {
      data.sort((a, b) => a.price - b.price);
    } else if (activePriceSort === 'Price (High to Low)') {
      data.sort((a, b) => b.price - a.price);
    }

    return data;
  }, [products, activeTopic, activeRarity, activePriceSort]); // Thêm activeRarity vào dependencies

  const renderProductItem = ({ item }: { item: ProductOnSaleItem }) => (
    <ProductItem
      item={item}
      // Route 'Collection Detail' đang trỏ đến màn hình ProductDetail.tsx
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
        filters={[...topics, ...rarityFilters.slice(1), ...priceFilters]} // Bỏ 'All' của rarity để tránh trùng lặp
        onSelectFilter={handleFilterSelect}
        // Hiển thị filter đang được chọn
        activeFilter={activeTopic !== 'All' ? activeTopic : activeRarity !== 'All' ? activeRarity : activePriceSort}
      />
      <FlatList
        data={filteredAndSortedData}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2} // Hiển thị dạng lưới 2 cột
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