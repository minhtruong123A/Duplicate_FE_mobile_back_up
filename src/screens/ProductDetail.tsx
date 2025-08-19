import React, { useState, useEffect } from 'react'; // THÊM MỚI: useEffect
import {
  View, Text, StyleSheet, Image, SafeAreaView, ScrollView, TouchableOpacity, Alert, // THÊM LẠI Image VÀO ĐÂY
  Modal, TextInput, TouchableWithoutFeedback,
  ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import {
  ShopStackScreenProps,
  RootStackNavigationProp,
  ProductOnSaleDetailItem, // THÊM MỚI: Type cho sản phẩm
  Comment,
  RatingItem  // GIỮ NGUYÊN: Type cho comment
} from '../types/types';

// THÊM MỚI: Import API và component ảnh
import { getProductOnSaleDetail, buyProductOnSale } from '../services/api.product';
import { addToCart } from '../services/api.cart'; // THÊM MỚI
import ApiImage from '../components/ApiImage';
import { censorText } from '../utils/censorText';  // Import utility mới
import { useAuth } from '../context/AuthContext';

// --- API ---
import { getAllRatingsBySellProduct, getAllCommentsBySellProduct, createComment } from '../services/api.comment';
import { createReport } from '../services/api.user';

// --- Icons ---
import ChatIcon from '../../assets/icons/chat.svg';
import CartIconOutline from '../../assets/icons/cart_outline.svg';

const StarIcon = ({ filled, size = 16 }: { filled: boolean, size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#FFD700" : "none"} stroke={filled ? "#FFD700" : "#ccc"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);
const ReportIcon = (props: any) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12zM4 22v-7" stroke="#666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);


// --- Components ---
// GIỮ NGUYÊN TOÀN BỘ CÁC COMPONENT PHỤ (StarRating, ReportModal)
const StarRating = ({ rating, reviewCount }: { rating: number, reviewCount: number }) => (
  <View style={styles.starRatingContainer}>
    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    <View style={styles.stars}>
      {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < Math.round(rating)} />)}
    </View>
    <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
  </View>
);
// ... (Code của ReportModal giữ nguyên)
const ReportModal = ({ visible, onClose, onSubmit }: { visible: boolean, onClose: () => void, onSubmit: (title: string, content: string) => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập cả tiêu đề và nội dung báo cáo.");
      return;
    }
    onSubmit(title, content);
    setTitle('');
    setContent('');
  };
  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Report product</Text>
              <TextInput placeholder="Title" style={styles.modalInput} value={title} onChangeText={setTitle} />
              <TextInput placeholder="Content" style={[styles.modalInput, styles.modalContentInput]} multiline value={content} onChangeText={setContent} />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};


// THAY ĐỔI: Hàm getRarityColor nhận string và xử lý chữ hoa/thường
const getRarityColor = (rarity?: string) => {
  if (!rarity) return '#000';
  const lowerRarity = rarity.toLowerCase();
  switch (lowerRarity) {
    case 'legendary': return '#FFD700'; case 'epic': return '#A020F0';
    case 'rare': return '#1E90FF'; case 'uncommon': return '#32CD32';
    case 'common': return '#A9A9A9'; default: return '#000';
  }
};
const capitalizeFirstLetter = (string?: string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function ProductDetail({ route }: ShopStackScreenProps<'Collection Detail'>) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { productId } = route.params;

  // THÊM MỚI: Lấy thông tin người dùng hiện tại
  const { user: currentUser, isAuctionJoined } = useAuth();

  // THÊM MỚI: State cho dữ liệu API
  const [product, setProduct] = useState<ProductOnSaleDetailItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // THÊM MỚI: State riêng cho các hành động ở footer để không bị xung đột
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // GIỮ NGUYÊN: State và logic cho comment và report
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  // const [comments, setComments] = useState(fakeCommentData.filter(c => c.productId === productId));
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // State cho việc gửi comment/report

  // --- Data Fetching ---
  // THÊM MỚI: Hàm xử lý cho nút "Add to Cart"
  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      const response = await addToCart({ sellProductId: productId, mangaBoxId: "" });
      if (response.status) {
        Alert.alert("Success", `${product?.name} has been added to your cart.`);
      } else {
        throw new Error(response.error || "Failed to add to cart.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // THÊM MỚI: Hàm xử lý cho nút "Buy Now"
  // HÀM ĐÃ ĐƯỢC CẬP NHẬT
  const handleBuyNow = async () => {
    if (isBuyingNow || !product) return;
    setIsBuyingNow(true);
    try {
      // buyProductOnSale sẽ trả về object: { status, data, error, ... }
      const response = await buyProductOnSale({ sellProductId: productId, quantity: 1 });

      // SỬA LỖI: Chỉ cần kiểm tra 'response.status' ở lớp ngoài cùng.
      if (response.status) {
        Alert.alert(
          "Purchase Successful!",
          response.data?.message || "Thank you for your purchase." // Lấy message động từ API
        );
        navigation.navigate('OrderHistory');
      } else {
        // Nếu status là false, ném lỗi với message từ API để khối catch xử lý
        throw new Error(response.error || "Failed to complete purchase.");
      }
    } catch (err: any) {
      // Khối catch này giờ sẽ bắt các lỗi được throw từ trên và lỗi mạng/server
      const errorMessage = err.message || "An error occurred during purchase.";

      // Logic xử lý 'out of stock' vẫn hữu ích và nên giữ lại
      if (errorMessage.toLowerCase().includes("out of stock or no longer available")) {
        Alert.alert(
          "Product Unavailable",
          "This product may no longer be available or the quantity has changed.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Purchase Failed", errorMessage);
      }
    } finally {
      setIsBuyingNow(false);
    }
  };


  const fetchData = async () => {
    try {
      // Fetch đồng thời ratings và comments
      const [ratingsResponse, commentsResponse] = await Promise.all([
        getAllRatingsBySellProduct(productId),
        getAllCommentsBySellProduct(productId),
      ]);

      // Xử lý Ratings
      if (ratingsResponse.status && Array.isArray(ratingsResponse.data)) {
        const ratings: RatingItem[] = ratingsResponse.data;
        setReviewCount(ratings.length);
        if (ratings.length > 0) {
          const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
          setAvgRating(totalRating / ratings.length);
        } else {
          setAvgRating(0);
        }
      }

      // Xử lý Comments
      if (commentsResponse.status && Array.isArray(commentsResponse.data)) {
        // Lọc các comment có status = 1 (active)
        const activeComments = commentsResponse.data.filter((c: Comment) => c.status === 1);
        setComments(activeComments);
      }
    } catch (err) {
      // console.error("Failed to fetch ratings or comments", err);
      // Có thể set state lỗi riêng cho từng phần nếu muốn
    }
  };


  // THÊM MỚI: useEffect để fetch dữ liệu
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await getProductOnSaleDetail(productId);
        if (response.status && response.data && response.data.quantity > 0) {
          setProduct(response.data);
          // Sau khi có productId, fetch ratings và comments
          await fetchData();
        } else {
          throw new Error('Product not found');
        }
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [productId]);

  // GIỮ NGUYÊN: Các handler cho comment và report
  // --- Handlers ---
  const handlePostComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1. Lọc từ cấm
      const censoredContent = await censorText(newComment);

      // 2. Gọi API tạo comment
      const response = await createComment({
        sellProductId: productId,
        content: censoredContent,
      });

      if (response.status) {
        Alert.alert("Success", "Your comment has been posted.");
        setNewComment('');
        // 3. Tải lại danh sách comment để cập nhật
        await fetchData();
      } else {
        throw new Error(response.error || "Failed to post comment.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred while posting your comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportSubmit = async (title: string, content: string) => {
    if (!product || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await createReport({
        sellProductId: productId,
        sellerId: product.userId,
        title,
        content,
      });

      if (response.status) {
        setReportModalVisible(false);
        Alert.alert("Success", "Your report has been submitted.");
      } else {
        throw new Error(response.error || "Failed to submit report.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred while submitting your report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // THÊM MỚI: Giao diện loading và error
  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} size="large" color="#d9534f" /></SafeAreaView>;
  }

  if (error || !product) {
    return <SafeAreaView style={styles.container}><View style={styles.notFoundContainer}><Text style={styles.notFoundText}>{error || 'Không tìm thấy sản phẩm!'}</Text></View></SafeAreaView>;
  }
  // THÊM MỚI: Biến kiểm tra để ẩn/hiện nút report
  const isMyProduct = currentUser?.id === product?.userId;
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "android" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 70 : 0}
      >
        <ReportModal visible={isReportModalVisible} onClose={() => setReportModalVisible(false)} onSubmit={handleReportSubmit} />
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* THAY ĐỔI: Dùng ApiImage và dữ liệu từ state 'product' */}
          <View style={styles.imageContainer}><ApiImage urlPath={product.urlImage} style={styles.mainImage} /></View>
          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.collectionText}>Collection: {product.topic}</Text>
              {!isMyProduct && (
                <TouchableOpacity onPress={() => setReportModalVisible(true)} style={styles.reportButton}>
                  <ReportIcon />
                  <Text style={styles.reportButtonText}>Report</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.nameText}>{product.name}</Text>

            {/* GIỮ NGUYÊN: Dùng dữ liệu giả cho StarRating vì API không có */}
            <StarRating rating={avgRating} reviewCount={reviewCount} />

            <View style={styles.rarityContainer}><Text style={[styles.rarityText, { color: getRarityColor(product.rateName) }]}>{capitalizeFirstLetter(product.rateName)}</Text></View>
            <Text style={styles.priceText}>{product.price.toLocaleString('vi-VN')} VND</Text>

            <TouchableOpacity style={styles.sellerContainer} onPress={() => navigation.navigate('SellerProfile', { sellerId: product.userId })}>
              <ApiImage urlPath={product.userProfileImage} style={styles.sellerAvatar} />
              <View><Text style={styles.sellerLabel}>Sold by</Text><Text style={styles.sellerName}>{product.username}</Text></View>
            </TouchableOpacity>

            <View style={styles.divider} />
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
            <Text style={styles.quantityText}>Quantity left: {product.quantity}</Text>

            {/* GIỮ NGUYÊN HOÀN TOÀN PHẦN BÌNH LUẬN */}
            <View style={styles.divider} />
            <Text style={styles.descriptionTitle}>Rating & Comment</Text>
            {comments.map(comment => (
              <View key={comment.id} style={styles.commentContainer}>
                <ApiImage urlPath={comment.profileImage} style={styles.commentAvatar} />
                <View style={styles.commentBody}>
                  <Text style={styles.commentAuthor}>{comment.username}</Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <Text style={styles.commentTimestamp}>
                    {new Date(comment.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </View>
              </View>
            ))}
            <View style={styles.commentInputContainer}>
              <TextInput
                placeholder="Write a comment..."
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                style={[styles.postButton, isSubmitting && styles.disabledButton]}
                onPress={handlePostComment}
                disabled={isSubmitting}
              >
                <Text style={styles.postButtonText}>Send</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>

        {/* GIỮ NGUYÊN FOOTER, CHỈ CẬP NHẬT DỮ LIỆU */}


        {/* CẬP NHẬT: Footer với các hàm onPress mới */}
        <View style={styles.footer}>
          {!isMyProduct ? (
            <View style={styles.leftActions}>
              <TouchableOpacity
                style={styles.iconButton}
                // onPress={() => navigation.navigate('Chatbox', { userName: product.username, avatarUrl: product.userProfileImage || '' })}
                onPress={() => navigation.navigate('Chatbox', {
                  userName: product.username,
                  avatarUrl: product.userProfileImage || '',
                  otherUserId: product.userId // <-- Thêm dòng này vào
                })}
                disabled={isAddingToCart || isBuyingNow}
              >
                <ChatIcon width={24} height={24} />
                <Text style={styles.iconButtonText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleAddToCart}
                disabled={isAddingToCart || isBuyingNow}
              >
                {isAddingToCart ? (
                  <ActivityIndicator size="small" color="#d9534f" />
                ) : (
                  <CartIconOutline width={24} height={24} />
                )}
                <Text style={styles.iconButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.leftActions} />
          )}

          {!isMyProduct ? (
            <TouchableOpacity
              style={[styles.buyButton, (isBuyingNow || isAddingToCart || isAuctionJoined) && styles.disabledButton]}
              onPress={handleBuyNow}
              disabled={isBuyingNow || isAddingToCart || isAuctionJoined}
            >
              {isBuyingNow ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buyButtonText}>Buy now</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={[styles.buyButton, styles.disabledButton]}>
              <Text style={styles.buyButtonText}>Your Item</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}

// GIỮ NGUYÊN TOÀN BỘ STYLES
const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: '#ccc',
  },
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100 },
  notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 20, fontFamily: 'Oxanium-Bold', color: '#888' },
  imageContainer: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#f0f2f5' },
  mainImage: { width: '60%', height: 350, resizeMode: 'contain' },
  infoContainer: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  collectionText: { fontSize: 16, fontFamily: 'Oxanium-Regular', color: '#666', marginBottom: 8 },
  reportButton: { flexDirection: 'row', alignItems: 'center' },
  reportButtonText: { marginLeft: 4, color: '#666', fontFamily: 'Oxanium-Regular' },
  nameText: { fontSize: 24, fontFamily: 'Oxanium-Bold', color: '#222', lineHeight: 32 },
  starRatingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stars: { flexDirection: 'row' },
  ratingText: { fontFamily: 'Oxanium-Bold', marginRight: 4, fontSize: 16 },
  reviewCount: { fontFamily: 'Oxanium-Regular', color: '#666', marginLeft: 8 },
  rarityContainer: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5, borderColor: '#e0e0e0', marginTop: 12 },
  rarityText: { fontSize: 16, fontFamily: 'Oxanium-Bold' },
  priceText: { fontSize: 28, fontFamily: 'Oxanium-Bold', color: '#d9534f', marginVertical: 16 },
  sellerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef' },
  sellerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e0e0e0' },
  sellerLabel: { fontSize: 14, fontFamily: 'Oxanium-Regular', color: '#666' },
  sellerName: { fontSize: 16, fontFamily: 'Oxanium-SemiBold', color: '#333' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 20 },
  descriptionTitle: { fontSize: 18, fontFamily: 'Oxanium-SemiBold', color: '#333', marginBottom: 10 },
  descriptionText: { fontSize: 16, fontFamily: 'Oxanium-Regular', color: '#555', lineHeight: 24, marginBottom: 20 },
  quantityText: { fontSize: 16, fontFamily: 'Oxanium-Regular', color: '#333', fontStyle: 'italic' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  iconButtonText: {
    fontSize: 12,
    fontFamily: 'Oxanium-Regular',
    color: '#666',
    marginTop: 2,
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#d9534f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  buyButtonText: {
    fontSize: 18,
    fontFamily: 'Oxanium-Bold',
    color: '#fff'
  },
  // ... (giữ nguyên các style khác cho modal và comment)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontFamily: 'Oxanium-Bold', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, fontFamily: 'Oxanium-Regular' },
  modalContentInput: { height: 100, textAlignVertical: 'top' },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
  cancelButton: { backgroundColor: '#f0f2f5' },
  cancelButtonText: { fontFamily: 'Oxanium-Bold', color: '#333' },
  submitButton: { backgroundColor: '#d9534f' },
  submitButtonText: { fontFamily: 'Oxanium-Bold', color: '#fff' },
  commentContainer: { flexDirection: 'row', marginBottom: 16 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e0e0e0' },
  commentBody: { flex: 1 },
  commentAuthor: { fontFamily: 'Oxanium-Bold' },
  commentText: { fontFamily: 'Oxanium-Regular', color: '#333', marginTop: 4 },
  commentTimestamp: { fontSize: 12, color: '#999', marginTop: 4 },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  postButton: { backgroundColor: '#d9534f', padding: 10, borderRadius: 20 },
  postButtonText: { color: '#fff', fontFamily: 'Oxanium-Bold' },
});