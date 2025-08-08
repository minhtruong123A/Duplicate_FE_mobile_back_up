// src/screens/ProductDetail.tsx

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, SafeAreaView, ScrollView, TouchableOpacity, Alert,
  Modal, TextInput, TouchableWithoutFeedback, Keyboard, FlatList
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { ShopStackScreenProps, RootStackNavigationProp } from '../types/types';
import { fakeProductData, Rarity } from '../data/productData';
import { fakeUserData } from '../data/userData';
import { fakeCommentData, Comment } from '../data/commentData';

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
const StarRating = ({ rating, reviewCount }: { rating: number, reviewCount: number }) => (
  <View style={styles.starRatingContainer}>
    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    <View style={styles.stars}>
      {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < Math.round(rating)} />)}
    </View>
    <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>
  </View>
);

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

const getRarityColor = (rarity: Rarity) => {
  switch (rarity) {
    case 'Legendary': return '#FFD700'; case 'Epic': return '#A020F0';
    case 'Rare': return '#1E90FF'; case 'Uncommon': return '#32CD32';
    case 'Common': return '#A9A9A9'; default: return '#000';
  }
};

export default function ProductDetail({ route }: ShopStackScreenProps<'Collection Detail'>) {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { productId } = route.params;
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [comments, setComments] = useState(fakeCommentData.filter(c => c.productId === productId));
  const [newComment, setNewComment] = useState('');

  const product = fakeProductData.find((item) => item.id === productId);
  const seller = fakeUserData.find(user => user.id === product?.sellerId);

  if (!product || !seller) {
    return <SafeAreaView style={styles.container}><View style={styles.notFoundContainer}><Text style={styles.notFoundText}>Không tìm thấy sản phẩm!</Text></View></SafeAreaView>;
  }

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const newCommentData: Comment = {
      id: `cmt${Math.random()}`, productId, author: 'CurrentUser',
      avatarUrl: 'https://placehold.co/40x40/EFEFEF/333?text=ME',
      text: newComment, rating: 5, timestamp: 'Vừa xong',
    };
    setComments([newCommentData, ...comments]);
    setNewComment('');
    Keyboard.dismiss();
  };

  const handleReportSubmit = (title: string, content: string) => {
    console.log({ title, content });
    setReportModalVisible(false);
    Alert.alert("Thành công", "Báo cáo của bạn đã được gửi đi.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ReportModal visible={isReportModalVisible} onClose={() => setReportModalVisible(false)} onSubmit={handleReportSubmit} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}><Image source={{ uri: product.imageUrl }} style={styles.mainImage} /></View>
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.collectionText}>Collection: {product.collection}</Text>
            <TouchableOpacity onPress={() => setReportModalVisible(true)} style={styles.reportButton}>
              <ReportIcon />
              <Text style={styles.reportButtonText}>Report</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{product.name}</Text>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          <View style={styles.rarityContainer}><Text style={[styles.rarityText, { color: getRarityColor(product.rateName) }]}>{product.rateName}</Text></View>
          <Text style={styles.priceText}>{product.price.toLocaleString('vi-VN')} đ</Text>
          <TouchableOpacity style={styles.sellerContainer} onPress={() => navigation.navigate('SellerProfile', { sellerId: seller.id })}>
            <Image source={{ uri: seller.avatarUrl }} style={styles.sellerAvatar} />
            <View><Text style={styles.sellerLabel}>Sold by</Text><Text style={styles.sellerName}>{seller.name}</Text></View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
          <Text style={styles.quantityText}>Quantity left: {product.quantity}</Text>
          <View style={styles.divider} />
          <Text style={styles.descriptionTitle}>Rating & Comment</Text>
          {comments.map(comment => (
            <View key={comment.id} style={styles.commentContainer}>
              <Image source={{ uri: comment.avatarUrl }} style={styles.commentAvatar} />
              <View style={styles.commentBody}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <View style={styles.stars}><StarRating rating={comment.rating} reviewCount={0} /></View>
                <Text style={styles.commentText}>{comment.text}</Text>
                <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
              </View>
            </View>
          ))}
          <View style={styles.commentInputContainer}>
            <TextInput placeholder="Viết bình luận..." style={styles.commentInput} value={newComment} onChangeText={setNewComment} multiline />
            <TouchableOpacity style={styles.postButton} onPress={handlePostComment}><Text style={styles.postButtonText}>Send</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* CẬP NHẬT: Thay đổi bố cục Footer */}
      <View style={styles.footer}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Chatbox', { userName: seller.name, avatarUrl: seller.avatarUrl })}
          >
            <ChatIcon width={24} height={24} />
            <Text style={styles.iconButtonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => Alert.alert('Thêm vào giỏ hàng', `${product.name} đã được thêm vào mục yêu thích.`)}
          >
            <CartIconOutline width={24} height={24} />
            <Text style={styles.iconButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buyButton} onPress={() => Alert.alert('Thông báo', 'Chức năng đang được phát triển!')}>
          <Text style={styles.buyButtonText}>Buy now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  sellerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  sellerLabel: { fontSize: 14, fontFamily: 'Oxanium-Regular', color: '#666' },
  sellerName: { fontSize: 16, fontFamily: 'Oxanium-SemiBold', color: '#333' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 20 },
  descriptionTitle: { fontSize: 18, fontFamily: 'Oxanium-SemiBold', color: '#333', marginBottom: 10 },
  descriptionText: { fontSize: 16, fontFamily: 'Oxanium-Regular', color: '#555', lineHeight: 24, marginBottom: 20 },
  quantityText: { fontSize: 16, fontFamily: 'Oxanium-Regular', color: '#333', fontStyle: 'italic' },
  // CẬP NHẬT: Styles cho Footer
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
  // Modal Styles
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
  // Comment Styles
  commentContainer: { flexDirection: 'row', marginBottom: 16 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  commentBody: { flex: 1 },
  commentAuthor: { fontFamily: 'Oxanium-Bold' },
  commentText: { fontFamily: 'Oxanium-Regular', color: '#333', marginTop: 4 },
  commentTimestamp: { fontSize: 12, color: '#999', marginTop: 4 },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  postButton: { backgroundColor: '#d9534f', padding: 10, borderRadius: 20 },
  postButtonText: { color: '#fff', fontFamily: 'Oxanium-Bold' },
});
