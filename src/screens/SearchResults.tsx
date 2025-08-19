import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, ScrollView } from 'react-native'; // THÊM ScrollView
import { useNavigation } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';

// Import API và các type thật
import { getAllMysteryBoxes } from '../services/api.mysterybox';
import { getAllProductsOnSale } from '../services/api.product';
import { fetchAuctionList } from '../services/api.auction';
import { getOtherProfile } from '../services/api.user'; // THÊM MỚI: API lấy profile người dùng
import { RootStackNavigationProp, MysteryBoxItem, ProductOnSaleItem, AuctionItem, UserProfile } from '../types/types'; // THÊM MỚI: UserProfile
import ApiImage from '../components/ApiImage';

// THÊM MỚI: Type Auction kèm thông tin người bán
type AuctionWithSeller = AuctionItem & {
    seller?: UserProfile | null;
};

// CẬP NHẬT: Union type để bao gồm cả thông tin seller cho auction
type SearchResultItem =
    | (MysteryBoxItem & { itemType: 'box' })
    | (ProductOnSaleItem & { itemType: 'product' })
    | (AuctionWithSeller & { itemType: 'auction' });

type SearchResultsProps = {
    onClose: () => void;
};

const searchFilters = ['All', 'Mystery Box', 'Collection Store', 'Auction'];

const SearchIcon = (props: any) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="#666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function SearchResults({ onClose }: SearchResultsProps) {
    const navigation = useNavigation<RootStackNavigationProp>();

    const [allBoxes, setAllBoxes] = useState<MysteryBoxItem[]>([]);
    const [allProducts, setAllProducts] = useState<ProductOnSaleItem[]>([]);
    const [allAuctions, setAllAuctions] = useState<AuctionWithSeller[]>([]); // Sửa thành AuctionWithSeller
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [
                    boxResponse,
                    productResponse,
                    startedAuctionRes,
                    waitingAuctionRes
                ] = await Promise.all([
                    getAllMysteryBoxes(),
                    getAllProductsOnSale(),
                    fetchAuctionList('started'),
                    fetchAuctionList('waiting')
                ]);

                // Xử lý Auctions
                let combinedAuctions: AuctionItem[] = [];
                if (startedAuctionRes.success && Array.isArray(startedAuctionRes.data)) {
                    combinedAuctions.push(...startedAuctionRes.data.flat());
                }
                if (waitingAuctionRes.success && Array.isArray(waitingAuctionRes.data)) {
                    combinedAuctions.push(...waitingAuctionRes.data.flat());
                }

                // THÊM MỚI: Fetch thông tin seller cho mỗi auction
                const auctionsWithSeller = await Promise.all(
                    combinedAuctions.map(async (auction) => {
                        try {
                            const profileRes = await getOtherProfile(auction.seller_id);
                            return {
                                ...auction,
                                id: auction._id,
                                seller: profileRes.status ? profileRes.data : null,
                            };
                        } catch {
                            return { ...auction, id: auction._id, seller: null };
                        }
                    })
                );
                setAllAuctions(auctionsWithSeller);

                // Xử lý Boxes
                if (boxResponse.status && Array.isArray(boxResponse.data)) {
                    const activeBoxes = boxResponse.data.filter((box: MysteryBoxItem) => box.status === 1);
                    setAllBoxes(activeBoxes);
                }

                // Xử lý Products
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
    }, []);

    const searchResults = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (!query || isLoading) return [];

        let results: SearchResultItem[] = [];

        // Tìm kiếm Boxes
        if (activeFilter === 'All' || activeFilter === 'Mystery Box') {
            results.push(...allBoxes
                .filter(box => box.mysteryBoxName.toLowerCase().includes(query))
                .map(box => ({ ...box, itemType: 'box' as const }))
            );
        }

        // Tìm kiếm Products
        if (activeFilter === 'All' || activeFilter === 'Collection Store') {
            results.push(...allProducts
                .filter(product => product.name.toLowerCase().includes(query))
                .map(product => ({ ...product, itemType: 'product' as const }))
            );
        }

        // Tìm kiếm Auctions
        if (activeFilter === 'All' || activeFilter === 'Auction') {
            results.push(...allAuctions
                .filter(auction => auction.title.toLowerCase().includes(query))
                .map(auction => ({ ...auction, itemType: 'auction' as const }))
            );
        }

        return results;
    }, [searchQuery, activeFilter, allBoxes, allProducts, allAuctions, isLoading]);

    const handleItemPress = (item: SearchResultItem) => {
        onClose();
        if (item.itemType === 'box') {
            navigation.navigate('MainTabs', {
                screen: 'Shop',
                params: { screen: 'Box Detail', params: { boxId: item.id } },
            });
        } else if (item.itemType === 'product') {
            navigation.navigate('MainTabs', {
                screen: 'Shop',
                params: { screen: 'Collection Detail', params: { productId: item.id } },
            });
        } else if (item.itemType === 'auction') {
            navigation.navigate('MainTabs', {
                screen: 'Auction',
                params: {
                    screen: 'AuctionDetail',
                    params: {
                        auctionId: item._id,
                        startTime: new Date(item.start_time).toISOString(),
                        endTime: new Date(item.end_time).toISOString(),
                    },
                },
            });
        }
    };

    // THÊM MỚI: Hàm format thời gian để giải quyết lỗi 2
    const formatTimeLeft = (ms: number) => {
        if (ms < 0) return 'Ended';
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}d ${hours}h`;
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const renderItem = ({ item }: { item: SearchResultItem }) => {
        let name = '', subText = '', price: number | undefined, imageUrl: string | undefined;

        if (item.itemType === 'box') {
            name = item.mysteryBoxName;
            subText = item.collectionTopic;
            price = item.mysteryBoxPrice;
            imageUrl = item.urlImage;
        } else if (item.itemType === 'product') {
            name = item.name;
            subText = item.topic;
            price = item.price;
            imageUrl = item.urlImage;
        } else if (item.itemType === 'auction') {
            name = item.title;
            price = item.start_price;

            // SỬA LỖI 2: Phân biệt "Ongoing" và "Waiting"
            const now = new Date().getTime();
            const startTime = new Date(item.start_time).getTime();
            const endTime = new Date(item.end_time).getTime();

            if (now < startTime) {
                subText = `Starts in: ${formatTimeLeft(startTime - now)}`;
            } else {
                subText = `Ends in: ${formatTimeLeft(endTime - now)}`;
            }

            // SỬA LỖI 3: Lấy ảnh đúng thứ tự ưu tiên
            imageUrl = item.productImageUrl || item.seller?.profileImage || undefined;
        }

        return (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleItemPress(item)}>
                <ApiImage urlPath={imageUrl} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{name}</Text>
                    <Text style={styles.itemCollection}>{subText}</Text>
                </View>
                {price !== undefined && (
                    <Text style={styles.itemPrice}>{price.toLocaleString('vi-VN')} VND</Text>
                )}
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

            {/* SỬA LỖI 1: Dùng ScrollView cho thanh filter */}
            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                >
                    {searchFilters.map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

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
    // SỬA LỖI 1: Cập nhật style cho filter
    filterContainer: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12, // Thêm padding 2 bên
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
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