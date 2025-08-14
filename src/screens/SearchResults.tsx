import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';

// CẬP NHẬT: Import API và các type thật
import { getAllMysteryBoxes } from '../services/api.mysterybox';
import { getAllProductsOnSale } from '../services/api.product';
import { RootStackNavigationProp, MysteryBoxItem, ProductOnSaleItem } from '../types/types';
import ApiImage from '../components/ApiImage'; // Dùng component ảnh chung

// CẬP NHẬT: Union type dùng type thật từ API
type SearchResultItem = (MysteryBoxItem & { itemType: 'box' }) | (ProductOnSaleItem & { itemType: 'product' });

type SearchResultsProps = {
    onClose: () => void;
};

const searchFilters = ['All', 'Mystery Box', 'Collection Store'];

const SearchIcon = (props: any) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="#666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function SearchResults({ onClose }: SearchResultsProps) {
    const navigation = useNavigation<RootStackNavigationProp>();

    // THÊM MỚI: State để lưu toàn bộ dữ liệu từ API
    const [allBoxes, setAllBoxes] = useState<MysteryBoxItem[]>([]);
    const [allProducts, setAllProducts] = useState<ProductOnSaleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true); // State cho lần tải dữ liệu đầu tiên
    const [error, setError] = useState<string | null>(null);

    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // THÊM MỚI: useEffect để tải toàn bộ dữ liệu khi component được mở
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Gọi đồng thời 2 API để tăng tốc
                const [boxResponse, productResponse] = await Promise.all([
                    getAllMysteryBoxes(),
                    getAllProductsOnSale(),
                ]);

                // Xử lý và lưu trữ dữ liệu Mystery Boxes
                if (boxResponse.status && Array.isArray(boxResponse.data)) {
                    const activeBoxes = boxResponse.data.filter((box: MysteryBoxItem) => box.status === 1);
                    setAllBoxes(activeBoxes);
                }

                // Xử lý và lưu trữ dữ liệu Products
                if (productResponse.status && Array.isArray(productResponse.data)) {
                    const availableProducts = productResponse.data.filter((p: ProductOnSaleItem) => p.quantity > 0 && p.isSell);
                    setAllProducts(availableProducts);
                }

                setError(null);
            } catch (err) {
                console.error("Failed to load search data:", err);
                setError("Could not load data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

    // CẬP NHẬT: useMemo giờ sẽ tìm kiếm trên dữ liệu thật đã tải về
    const searchResults = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (!query || isLoading) return []; // Không tìm kiếm nếu chưa nhập hoặc đang tải dữ liệu

        let results: SearchResultItem[] = [];

        // Tìm kiếm trong Mystery Boxes
        if (activeFilter === 'All' || activeFilter === 'Mystery Box') {
            const boxResults = allBoxes
                .filter(box => box.mysteryBoxName.toLowerCase().includes(query))
                .map(box => ({ ...box, itemType: 'box' as const }));
            results.push(...boxResults);
        }

        // Tìm kiếm trong Products
        if (activeFilter === 'All' || activeFilter === 'Collection Store') {
            const productResults = allProducts
                .filter(product => product.name.toLowerCase().includes(query))
                .map(product => ({ ...product, itemType: 'product' as const }));
            results.push(...productResults);
        }

        return results;
    }, [searchQuery, activeFilter, allBoxes, allProducts, isLoading]);

    const handleItemPress = (item: SearchResultItem) => {
        onClose(); // Đóng cửa sổ tìm kiếm
        if (item.itemType === 'box') {
            navigation.navigate('MainTabs', {
                screen: 'Shop',
                params: {
                    screen: 'Box Detail',
                    params: { boxId: item.id },
                },
            });
        } else {
            navigation.navigate('MainTabs', {
                screen: 'Shop',
                params: {
                    screen: 'Collection Detail',
                    params: { productId: item.id },
                },
            });
        }
    };

    // CẬP NHẬT: renderItem để hiển thị đúng thuộc tính từ API
    const renderItem = ({ item }: { item: SearchResultItem }) => {
        const name = item.itemType === 'box' ? item.mysteryBoxName : item.name;
        const subText = item.itemType === 'box' ? item.collectionTopic : item.topic;
        // SỬA LỖI: Lấy giá tiền theo đúng tên thuộc tính của từng loại item
        const price = item.itemType === 'box' ? item.mysteryBoxPrice : item.price;

        return (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleItemPress(item)}>
                <ApiImage urlPath={item.urlImage} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{name}</Text>
                    <Text style={styles.itemCollection}>{subText}</Text>
                </View>
                <Text style={styles.itemPrice}>{price.toLocaleString('vi-VN')} đ</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchHeader}>
                <View style={styles.searchBar}>
                    <SearchIcon />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Find boxes, collections..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={true}
                        returnKeyType="search"
                    />
                </View>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                {searchFilters.map(filter => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
                        onPress={() => setActiveFilter(filter)}
                    >
                        <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* CẬP NHẬT: Hiển thị ActivityIndicator khi đang tải dữ liệu ban đầu */}
            {isLoading ? (
                <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#d9534f" />
            ) : (
                <FlatList
                    data={searchResults}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id + item.itemType}
                    ListEmptyComponent={
                        searchQuery ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No results for "{searchQuery}"</Text>
                                {error && <Text style={styles.errorText}>{error}</Text>}
                            </View>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    searchHeader: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f2f5', borderRadius: 10, paddingHorizontal: 10 },
    searchInput: { flex: 1, height: 40, paddingHorizontal: 8, fontFamily: 'Oxanium-Regular', fontSize: 16 },
    cancelButton: { marginLeft: 10, fontSize: 16, fontFamily: 'Oxanium-SemiBold', color: '#d9534f' },
    filterContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginHorizontal: 4, backgroundColor: '#f0f2f5' },
    activeFilterButton: { backgroundColor: '#d9534f' },
    filterText: { fontFamily: 'Oxanium-SemiBold', color: '#333' },
    activeFilterText: { color: '#fff' },
    resultItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#e0e0e0' },
    itemInfo: { flex: 1 },
    itemName: { fontFamily: 'Oxanium-Bold', fontSize: 16 },
    itemCollection: { fontFamily: 'Oxanium-Regular', fontSize: 12, color: '#666' },
    itemPrice: { fontFamily: 'Oxanium-SemiBold', fontSize: 14, color: '#d9534f' },
    emptyContainer: { paddingTop: 50, alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#666', fontFamily: 'Oxanium-Regular' },
    errorText: { fontSize: 14, color: 'red', marginTop: 10 },
});