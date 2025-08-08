// src/screens/BoxDetail.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ShopStackScreenProps } from '../types/types';
// Import dữ liệu và kiểu từ file chung
import { fakeBoxData } from '../data/boxData';

export default function BoxDetail({ route, navigation }: ShopStackScreenProps<'Box Detail'>) {
  // Lấy boxId từ route.params một cách an toàn
  const { boxId } = route.params;

  // Tìm kiếm box tương ứng trong mảng dữ liệu
  const box = fakeBoxData.find((item) => item.id === boxId);

  // Xử lý trường hợp không tìm thấy box
  if (!box) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Không tìm thấy sản phẩm!</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Nếu tìm thấy, hiển thị chi tiết
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ảnh lớn của sản phẩm */}
        <Image source={{ uri: box.imageUrl }} style={styles.mainImage} />

        <View style={styles.infoContainer}>
          {/* Tên bộ sưu tập */}
          <Text style={styles.collectionText}>BST: {box.collection}</Text>

          {/* Tên sản phẩm */}
          <Text style={styles.nameText}>{box.name}</Text>

          {/* Giá tiền */}
          <Text style={styles.priceText}>
            {box.price.toLocaleString('vi-VN')} đ
          </Text>

          {/* Đường kẻ ngang phân cách */}
          <View style={styles.divider} />

          {/* Mô tả sản phẩm */}
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{box.description}</Text>

          {/* Vật phẩm bên trong */}
          <Text style={styles.descriptionTitle}>Vật phẩm có thể có</Text>
          {box.itemsInside.map((item, index) => (
            <Text key={index} style={styles.itemInsideText}>
              • {item}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Nút Mua ngay */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => Alert.alert('Notice', 'Chức năng đang được phát triển!')}
        >
          <Text style={styles.buyButtonText}>Buy now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100, // Tạo khoảng trống cho nút Mua
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 20,
    fontFamily: 'Oxanium-Bold',
    color: '#888',
  },
  mainImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#f0f2f5',
  },
  infoContainer: {
    padding: 20,
  },
  collectionText: {
    fontSize: 16,
    fontFamily: 'Oxanium-Regular',
    color: '#666',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 24,
    fontFamily: 'Oxanium-Bold',
    color: '#222',
    lineHeight: 32,
  },
  priceText: {
    fontSize: 28,
    fontFamily: 'Oxanium-Bold',
    color: '#d9534f',
    marginVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontFamily: 'Oxanium-SemiBold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Oxanium-Regular',
    color: '#555',
    lineHeight: 24,
    marginBottom: 20,
  },
  itemInsideText: {
    fontSize: 16,
    fontFamily: 'Oxanium-Regular',
    color: '#555',
    lineHeight: 24,
    marginLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buyButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    fontSize: 18,
    fontFamily: 'Oxanium-Bold',
    color: '#fff',
  },
});
