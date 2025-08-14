import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native'; // Thêm useFocusEffect
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator, // Thêm ActivityIndicator
} from 'react-native';
import { ShopTopTabScreenProps } from '../types/types';
import FilterBar from '../components/FilterBar';
// THÊM MỚI: Import API function và định nghĩa kiểu dữ liệu từ API
import { getAllMysteryBoxes } from '../services/api.mysterybox'; // Giả sử bạn đặt API trong file này
import { MysteryBoxItem } from '../types/types'; // Giả sử bạn có file định nghĩa type
import BoxItem from '../components/BoxItem';

// BỎ: Không cần fakeBoxData và collections tĩnh nữa
// const collections = ['All', ...Array.from(new Set(fakeBoxData.map(item => item.collection)))];
const priceFilters = ['Price (Low to High)', 'Price (High to Low)'];

export default function BoxShop({ navigation }: ShopTopTabScreenProps<'Mystery Box'>) {
  // THÊM MỚI: State để lưu dữ liệu từ API, trạng thái loading và lỗi
  const [boxes, setBoxes] = useState<MysteryBoxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCollection, setActiveCollection] = useState('All');
  const [activePriceSort, setActivePriceSort] = useState<string | null>(null);

  const fetchBoxes = useCallback(async () => {
    try {
      // Không set loading lại mỗi lần focus để tránh màn hình bị giật
      const response = await getAllMysteryBoxes();
      if (response.status && Array.isArray(response.data)) {
        const activeBoxes = response.data.filter((box: MysteryBoxItem) => box.status === 1);
        setBoxes(activeBoxes);
      } else {
        throw new Error('Invalid data format received from API');
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mystery boxes.');
    } finally {
      // Chỉ tắt loading lần đầu
      if (loading) setLoading(false);
    }
  }, [loading]); // Thêm 'loading' để hàm chỉ được tạo lại khi cần

  useFocusEffect(
    useCallback(() => {
      fetchBoxes();
    }, [fetchBoxes])
  );

  // THÊM MỚI: Tự động tạo danh sách collection từ dữ liệu API
  const collections = useMemo(() => {
    const uniqueTopics = new Set(boxes.map(item => item.collectionTopic));
    return ['All', ...Array.from(uniqueTopics)];
  }, [boxes]);

  const handleFilterSelect = (filter: string) => {
    if (collections.includes(filter)) {
      setActiveCollection(filter);
    } else if (priceFilters.includes(filter)) {
      setActivePriceSort(filter);
    } else {
      setActiveCollection('All');
      setActivePriceSort(null);
    }
  };

  // THAY ĐỔI: `useMemo` giờ sẽ phụ thuộc vào state `boxes` thay vì `fakeBoxData`
  const filteredAndSortedData = useMemo(() => {
    let data = [...boxes];

    // Lọc theo collection (dùng collectionTopic từ API)
    if (activeCollection !== 'All') {
      data = data.filter(item => item.collectionTopic === activeCollection);
    }

    // Sắp xếp theo giá (dùng mysteryBoxPrice từ API)
    if (activePriceSort === 'Price (Low to High)') {
      data.sort((a, b) => a.mysteryBoxPrice - b.mysteryBoxPrice);
    } else if (activePriceSort === 'Price (High to Low)') {
      data.sort((a, b) => b.mysteryBoxPrice - a.mysteryBoxPrice);
    }

    return data;
  }, [boxes, activeCollection, activePriceSort]);

  // THAY ĐỔI: `renderBoxItem` để khớp với tên trường của API
  // const renderBoxItem = ({ item }: { item: MysteryBoxItem }) => (
  //   <TouchableOpacity
  //     style={styles.itemContainer}
  //     // Truyền id của box sang màn hình chi tiết
  //     onPress={() => navigation.navigate('Box Detail', { boxId: item.id })}
  //   >
  //     {/* Sử dụng urlImage từ API */}
  //     <Image source={{ uri: item.urlImage }} style={styles.itemImage} />
  //     <View style={styles.itemInfo}>
  //       {/* Sử dụng mysteryBoxName, collectionTopic, mysteryBoxPrice */}
  //       <Text style={styles.itemName}>{item.mysteryBoxName}</Text>
  //       <Text style={styles.itemCollection}>Collection: {item.collectionTopic}</Text>
  //       <Text style={styles.itemPrice}>
  //         {item.mysteryBoxPrice.toLocaleString('vi-VN')} đ
  //       </Text>
  //     </View>
  //   </TouchableOpacity>
  // );
  const renderBoxItem = ({ item }: { item: MysteryBoxItem }) => (
    <BoxItem
      item={item}
      onPress={() => navigation.navigate('Box Detail', { boxId: item.id })}
    />
  );

  // THÊM MỚI: Xử lý giao diện khi đang tải hoặc có lỗi
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d9534f" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

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

// THÊM MỚI: Style cho màn hình loading và error
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    fontFamily: 'Oxanium-Regular',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
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
    backgroundColor: '#e0e0e0', // Thêm màu nền cho ảnh
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