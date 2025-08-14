import React, { useState } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { MysteryBoxItem } from '../types/types';
import { buildImageUrl } from '../services/api.imageproxy'; // giả sử có hàm buildImageUrl để đổi url sang proxy

type BoxItemProps = {
    item: MysteryBoxItem;
    onPress: () => void;
};

const BoxItem = ({ item, onPress }: BoxItemProps) => {
    const [useBackup, setUseBackup] = useState(false);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);

    // Tạo url chính hoặc backup
    const imageUri = useBackup
        ? buildImageUrl(item.urlImage, true) // build url backup, giả sử hàm này có tham số thứ 2 để đổi sang backup
        : buildImageUrl(item.urlImage);

    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <Image
                source={imageLoadFailed || !imageUri ? require('../../assets/logo.png') : { uri: imageUri }}
                style={styles.itemImage}
                onError={() => {
                    if (!useBackup) {
                        setUseBackup(true);
                    } else {
                        setImageLoadFailed(true);
                    }
                }}
            />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.mysteryBoxName}</Text>
                <Text style={styles.itemCollection}>Collection: {item.collectionTopic}</Text>
                <Text style={styles.itemPrice}>
                    {item.mysteryBoxPrice.toLocaleString('vi-VN')} đ
                </Text>
            </View>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
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
        backgroundColor: '#e0e0e0',
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

export default BoxItem;
