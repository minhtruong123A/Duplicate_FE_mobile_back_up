import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ProductOnSaleItem } from '../types/types';
import ApiImage from './ApiImage'; // Import component ảnh mới

interface ProductItemProps {
    item: ProductOnSaleItem;
    onPress: () => void;
}

// Hàm hỗ trợ để viết hoa chữ cái đầu
const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const getRarityColor = (rarity: string) => {
    const lowerRarity = rarity.toLowerCase();
    switch (lowerRarity) {
        case 'legendary': return '#FFD700';
        case 'epic': return '#A020F0';
        case 'rare': return '#1E90FF';
        case 'uncommon': return '#32CD32';
        case 'common': return '#A9A9A9';
        default: return '#000';
    }
};

const ProductItem: React.FC<ProductItemProps> = ({ item, onPress }) => {
    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <ApiImage urlPath={item.urlImage} style={styles.itemImage} resizeMode="contain" />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.rarityContainer}>
                    <View style={[styles.rarityDot, { backgroundColor: getRarityColor(item.rarityName) }]} />
                    <Text style={[styles.rarityText, { color: getRarityColor(item.rarityName) }]}>
                        {capitalizeFirstLetter(item.rarityName)}
                    </Text>
                </View>
                <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
            </View>
        </TouchableOpacity>
    );
};

const { width } = Dimensions.get('window');
const itemWidth = (width - 24) / 2; // 24 = 8*2 padding + 8 space

const styles = StyleSheet.create({
    itemContainer: {
        width: itemWidth,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        height: itemWidth * 1.1,
        backgroundColor: '#f8f8f8',
    },
    itemInfo: {
        padding: 12,
    },
    itemName: {
        fontSize: 14,
        fontFamily: 'Oxanium-SemiBold',
        color: '#333',
        height: 34, // Đảm bảo 2 dòng
    },
    rarityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    rarityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    rarityText: {
        fontSize: 12,
        fontFamily: 'Oxanium-Bold',
    },
    itemPrice: {
        fontSize: 16,
        fontFamily: 'Oxanium-Bold',
        color: '#d9534f',
    },
});

export default ProductItem;