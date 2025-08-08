// src/screens/SearchResults.tsx

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';

import { fakeBoxData, MysteryBox } from '../data/boxData';
import { fakeProductData, ProductCard } from '../data/productData';
import { RootStackNavigationProp } from '../types/types';

// Union type để gộp cả hai loại sản phẩm vào một danh sách
type SearchResultItem = (MysteryBox & { itemType: 'box' }) | (ProductCard & { itemType: 'product' });

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
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const searchResults = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (!query) return [];

        let results: SearchResultItem[] = [];

        // Lọc và tìm kiếm trong Mystery Boxes
        if (activeFilter === 'All' || activeFilter === 'Mystery Box') {
            const boxResults = fakeBoxData
                .filter(box => box.name.toLowerCase().includes(query))
                .map(box => ({ ...box, itemType: 'box' as const }));
            results.push(...boxResults);
        }

        // Lọc và tìm kiếm trong Products
        if (activeFilter === 'All' || activeFilter === 'Collection Store') {
            const productResults = fakeProductData
                .filter(product => product.name.toLowerCase().includes(query))
                .map(product => ({ ...product, itemType: 'product' as const }));
            results.push(...productResults);
        }

        return results;
    }, [searchQuery, activeFilter]);

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

    const renderItem = ({ item }: { item: SearchResultItem }) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => handleItemPress(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemCollection}>{item.collection}</Text>
            </View>
            <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchHeader}>
                <View style={styles.searchBar}>
                    <SearchIcon />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Find..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={true}
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
            <FlatList
                data={searchResults}
                renderItem={renderItem}
                keyExtractor={(item) => item.id + item.itemType}
                ListEmptyComponent={
                    searchQuery ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No result for "{searchQuery}"</Text>
                        </View>
                    ) : null
                }
            />
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
    itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
    itemInfo: { flex: 1 },
    itemName: { fontFamily: 'Oxanium-Bold', fontSize: 16 },
    itemCollection: { fontFamily: 'Oxanium-Regular', fontSize: 12, color: '#666' },
    itemPrice: { fontFamily: 'Oxanium-SemiBold', fontSize: 14, color: '#d9534f' },
    emptyContainer: { paddingTop: 50, alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#666', fontFamily: 'Oxanium-Regular' },
});
