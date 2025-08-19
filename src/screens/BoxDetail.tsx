import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator, // Thêm ActivityIndicator
} from 'react-native';
import ApiImage from '../components/ApiImage'; // THÊM MỚI
import { ShopStackScreenProps, MysteryBoxDetailItem, RootStackNavigationProp } from '../types/types';
// THÊM MỚI: Import API function và định nghĩa kiểu dữ liệu
import { getMysteryBoxDetail, buyMysteryBox } from '../services/api.mysterybox';
import { buildImageUrl } from '../services/api.imageproxy';
import { addToCart } from '../services/api.cart'; // THÊM MỚI
import CartIconOutline from '../../assets/icons/cart_outline.svg'; // THÊM MỚI
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext'; // THÊM MỚI


// THÊM MỚI: Component QuantitySelector
const QuantitySelector = ({ quantity, onDecrease, onIncrease }: { quantity: number, onDecrease: () => void, onIncrease: () => void }) => (
  <View style={styles.quantityContainer}>
    <TouchableOpacity onPress={onDecrease} style={styles.quantityButton}>
      <Text style={styles.quantityButtonText}>-</Text>
    </TouchableOpacity>
    <Text style={styles.quantityText}>{quantity}</Text>
    <TouchableOpacity onPress={onIncrease} style={styles.quantityButton}>
      <Text style={styles.quantityButtonText}>+</Text>
    </TouchableOpacity>
  </View>
);

export default function BoxDetail({ route }: ShopStackScreenProps<'Box Detail'>) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { boxId } = route.params;
  const { isAuctionJoined } = useAuth();

  // THÊM MỚI: State để lưu chi tiết box, loading và error
  const [box, setBox] = useState<MysteryBoxDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useBackup, setUseBackup] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const avatarUri = box ? buildImageUrl(box.urlImage, useBackup) : null;

  // THÊM MỚI: State cho các hành động
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // THÊM MỚI: useEffect để gọi API chi tiết sản phẩm
  useEffect(() => {
    if (!boxId) {
      setError('Box ID is missing.');
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await getMysteryBoxDetail(boxId);
        // API trả về { status, data, ...}, data là một object
        if (response.status && response.data) {
          setBox(response.data);
        } else {
          throw new Error('Invalid data format for box detail');
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch box details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [boxId]); // Phụ thuộc vào boxId, sẽ chạy lại nếu boxId thay đổi

  // --- Handlers ---
  const handleAddToCart = async () => {
    if (isAddingToCart || !box) return;
    setIsAddingToCart(true);
    try {
      const response = await addToCart({ sellProductId: "", mangaBoxId: box.id, quantity });
      if (response.status) {
        Alert.alert("Success", `${box.mysteryBoxName} (x${quantity}) has been added to your cart.`);
      } else {
        throw new Error(response.error || "Failed to add to cart.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isBuyingNow || !box) return;
    setIsBuyingNow(true);
    try {
      const response = await buyMysteryBox({ mangaBoxId: box.id, quantity });
      if (response.status) {
        Alert.alert("Purchase Successful!", "Thank you for your purchase. Check your collection for new items.");
        navigation.navigate('OrderHistory');
      } else {
        throw new Error(response.error || "Failed to complete purchase.");
      }
    } catch (err: any) {
      Alert.alert("Purchase Failed", err.message || "An error occurred.");
    } finally {
      setIsBuyingNow(false);
    }
  };

  // SỬA LỖI 1: Tách hàm xử lý tăng số lượng để thêm logic giới hạn
  const handleIncreaseQuantity = () => {
    if (quantity >= 10) {
      Alert.alert("Limit Reached", "You can only purchase up to 10 boxes.");
      return;
    }
    setQuantity(q => q + 1);
  };

  // --- Render Logic ---
  // THÊM MỚI: Xử lý giao diện khi đang tải hoặc có lỗi
  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#d9534f" />
      </SafeAreaView>
    );
  }

  // THAY ĐỔI: Xử lý trường hợp có lỗi hoặc không tìm thấy box
  if (error || !box) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>{error || 'Cannot find any product!'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // THAY ĐỔI: Giao diện hiển thị dữ liệu từ API
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sử dụng urlImage */}
        <ApiImage urlPath={box.urlImage} style={styles.mainImage} />

        <View style={styles.infoContainer}>
          {/* Sử dụng collectionTopic */}
          <Text style={styles.collectionText}>Collection: {box.collectionTopic}</Text>

          {/* Sử dụng mysteryBoxName */}
          <Text style={styles.nameText}>{box.mysteryBoxName}</Text>

          {/* Sử dụng mysteryBoxPrice */}
          <Text style={styles.priceText}>
            {box.mysteryBoxPrice.toLocaleString('vi-VN')} VND
          </Text>

          {/* THÊM MỚI: Bộ chọn số lượng */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <QuantitySelector
              quantity={quantity}
              onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
              onIncrease={handleIncreaseQuantity}
            />
          </View>

          <View style={styles.divider} />

          {/* Sử dụng mysteryBoxDescription */}
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{box.mysteryBoxDescription}</Text>

          {/* Sử dụng mảng products từ API */}
          {box.products && box.products.length > 0 && (
            <>
              <Text style={styles.descriptionTitle}>Product you can have</Text>
              {box.products.map((item, index) => (
                <Text key={index} style={styles.itemInsideText}>
                  • {item.productName} {/* Giả sử item có productName */}
                </Text>
              ))}
            </>
          )}

        </View>
      </ScrollView>

      {/* CẬP NHẬT: Footer mới với 2 nút */}
      <View style={styles.footer}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleAddToCart}
            disabled={isAddingToCart || isBuyingNow}
          >
            {isAddingToCart ?
              <ActivityIndicator size="small" color="#d9534f" /> :
              <CartIconOutline width={24} height={24} />
            }
            <Text style={styles.iconButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.buyButton, (isBuyingNow || isAddingToCart || isAuctionJoined) && styles.disabledButton]}
          onPress={handleBuyNow}
          disabled={isBuyingNow || isAddingToCart || isAuctionJoined}
        >
          {isBuyingNow ?
            <ActivityIndicator color="#fff" /> :
            <Text style={styles.buyButtonText}>Buy now</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Thêm style cho centerContainer
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
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
    marginTop: 10,
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
  // footer: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   padding: 16,
  //   backgroundColor: '#fff',
  //   borderTopWidth: 1,
  //   borderTopColor: '#eee',
  // },
  // buyButton: {
  //   backgroundColor: '#d9534f',
  //   paddingVertical: 16,
  //   borderRadius: 12,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // buyButtonText: {
  //   fontSize: 18,
  //   fontFamily: 'Oxanium-Bold',
  //   color: '#fff',
  // },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee',
    flexDirection: 'row', alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
  },
  iconButton: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 12,
  },
  iconButtonText: {
    fontSize: 12, fontFamily: 'Oxanium-Regular',
    color: '#666', marginTop: 2,
  },
  buyButton: {
    flex: 1, backgroundColor: '#d9534f',
    paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 12,
  },
  buyButtonText: {
    fontSize: 18, fontFamily: 'Oxanium-Bold', color: '#fff'
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  quantityLabel: {
    fontSize: 18,
    fontFamily: 'Oxanium-SemiBold',
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
  },
  quantityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quantityButtonText: {
    fontSize: 20,
    fontFamily: 'Oxanium-Bold',
    color: '#333',
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 18,
    fontFamily: 'Oxanium-Bold',
  },
});