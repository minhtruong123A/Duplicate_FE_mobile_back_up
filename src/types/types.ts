// src/types/types.ts

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Đảm bảo bạn đã import dòng này

export type AuthTabNavigationProp = MaterialTopTabNavigationProp<AuthStackParamList>;

// CẬP NHẬT: Thêm AuthStack và thay đổi RootStack
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

// THÊM DÒNG NÀY VÀO
export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Top Tab in Shop
export type ShopTopTabParamList = {
    'Mystery Box': undefined;
    'Collection Store': undefined;
};

// Top Tab in Shopping Cart
export type ShoppingCartTopTabParamList = {
    'Favorite Boxes': undefined;
    'Favorite Products': undefined;
};

// Top Tab in Transaction History
export type TransactionTopTabParamList = {
    Received: undefined;
    Spent: undefined;
};

// Stack for Shop tab
export type ShopStackParamList = {
    Shop: NavigatorScreenParams<ShopTopTabParamList>;
    'Box Detail': { boxId: string };
    'Collection Detail': { productId: string };
};

// CẬP NHẬT: Thêm các màn hình Auction
export type AuctionTopTabParamList = {
    'Đang diễn ra': undefined;
    'Của tôi': undefined;
};

// CẬP NHẬT: Thêm WithdrawRequest vào PaymentStackParamList
export type PaymentStackParamList = {
    Payment: undefined;
    TopUpPackages: undefined;
    WithdrawRequest: undefined; // <-- Thêm màn hình mới
};

// Stack for Shopping Cart (from header)
export type ShoppingCartStackParamList = {
    ShoppingCart: NavigatorScreenParams<ShoppingCartTopTabParamList>;
};

// Bottom Tab Navigator
export type RootTabParamList = {
    Shop: NavigatorScreenParams<ShopStackParamList>;
    Auction: NavigatorScreenParams<AuctionTopTabParamList>; // <-- Thay đổi ở đây
    Payment: NavigatorScreenParams<PaymentStackParamList>;
    Chat: undefined;
};

// Root Stack (Whole App)
export type RootStackParamList = {
    Auth: undefined; // Màn hình chứa tab Login/Register
    MainTabs: NavigatorScreenParams<RootTabParamList>;
    ShoppingCartStack: NavigatorScreenParams<ShoppingCartStackParamList>;
    Profile: { reload?: number };
    Settings: undefined;
    UpdateProfile: undefined;
    'Help & Feedback': undefined;
    TopUpPackages: undefined;
    SellerProfile: { sellerId: string }; // <-- Thêm màn hình mới
    Chatbox: { userName: string; avatarUrl: string };
    WithdrawRequest: undefined; // <-- Thêm màn hình mới
    AuctionDetail: { auctionId: string }; // <-- Thêm màn hình mới
    OrderHistory: undefined; // <-- Thêm màn hình mới
    ExchangeRequests: undefined; // <-- Thêm màn hình mới
};

// --- TYPE PROPS ---
export type RootStackScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>;

export type RootStackNavigationProp = RootStackScreenProps<'MainTabs'>['navigation'];

// SỬA LỖI: Thêm lại type helper này
export type ShopStackScreenProps<T extends keyof ShopStackParamList> =
    NativeStackScreenProps<ShopStackParamList, T>;

export type ShopTopTabScreenProps<T extends keyof ShopTopTabParamList> =
    CompositeScreenProps<
        MaterialTopTabScreenProps<ShopTopTabParamList, T>,
        NativeStackScreenProps<ShopStackParamList>
    >;

export type ShoppingCartTopTabScreenProps<T extends keyof ShoppingCartTopTabParamList> =
    CompositeScreenProps<
        MaterialTopTabScreenProps<ShoppingCartTopTabParamList, T>,
        NativeStackScreenProps<ShoppingCartStackParamList>
    >;


// khai bao type model
export type ProductInBox = {
    // Bạn có thể mở rộng các trường này dựa trên dữ liệu API thực tế
    productId: string;
    productName: string;
    urlImage: string;
};

/**
 * Kiểu dữ liệu cho mỗi Mystery Box trong danh sách (Trang BoxShop).
 * Khớp với response của API /get-all-mystery-box.
 */
export type MysteryBoxItem = {
    id: string;
    mysteryBoxName: string;
    mysteryBoxPrice: number;
    urlImage: string;
    collectionTopic: string;
    createdAt: string; // Đây là một chuỗi ISO 8601 date string
    status: number;
};

/**
 * Kiểu dữ liệu cho chi tiết một Mystery Box (Trang BoxDetail).
 * Khớp với response của API /get-mystery-box-detail/{id}.
 */
export type MysteryBoxDetailItem = {
    id: string;
    status: number;
    mysteryBoxName: string;
    mysteryBoxDescription: string;
    mysteryBoxPrice: number;
    collectionTopic: string;
    urlImage: string;
    totalProduct: number;
    products: ProductInBox[]; // Mảng các sản phẩm có thể có trong box
};

export type ProductOnSaleItem = {
    id: string;
    name: string;
    price: number;
    userId: string;
    username: string;
    quantity: number;
    topic: string;
    urlImage: string;
    rarityName: string; // ví dụ: 'epic', 'common'
    isSell: boolean;
    createdAt: string;
};

/**
 * Kiểu dữ liệu cho chi tiết một sản phẩm (Trang ProductDetail).
 * Khớp với response của API /get-product-on-sale/{id}.
 */
export type ProductOnSaleDetailItem = {
    id: string;
    name: string;
    price: number;
    userId: string;
    username: string;
    userProfileImage: string | null; // Có thể null
    topic: string;
    urlImage: string;
    rateName: string; // API chi tiết dùng 'rateName'
    description: string;
    quantity: number;
    isSell: boolean;
};

// export type Comment = {
//     id: string;
//     productId: string;
//     author: string;
//     avatarUrl: string;
//     text: string;
//     rating: number;
//     timestamp: string;
// };

// --- THÊM MỚI: TYPE CHO USER PROFILE ---
export type UserProfile = {
    id: string;
    username: string;
    email: string;
    profileImage: string | null; // Có thể null
    // Bạn có thể thêm các trường khác nếu cần
};

// --- THÊM MỚI: TYPE CHO ORDER HISTORY ---
export type OrderHistoryItem = {
    type: 'ProductBuy' | 'Box' | 'ProductSell';
    boxId: string | null;
    boxName: string | null;
    sellProductId: string | null;
    productId: string | null;
    productName: string | null;
    sellerUsername: string | null;
    // LƯU Ý: API trả về sellerUrlImage, có vẻ đây là ảnh của sản phẩm/box.
    // Chúng ta sẽ tạm dùng trường này làm ảnh hiển thị.
    sellerUrlImage: string | null;
    isSellSellProduct: boolean | null;
    quantity: number;
    totalAmount: number;
    transactionCode: string;
    purchasedAt: string; // ISO date string
};

// --- THÊM MỚI: TYPES CHO PAYMENT & TRANSACTION ---

export type WhoAmIResponseData = {
    access_token: string;
    token_type: string;
    user_id: string;
    username: string;
    wallet_amount: number;
    profile_image: string | null;
    role: string;
};

export type TransactionItem = {
    id: string;
    type: 'Recharge' | 'Withdraw'; // Và các loại khác nếu có
    status: 'Pending' | 'Success' | 'Cancel';
    amount: number;
    transactionCode: string;
    dataTime: string; // ISO date string
};

// --- THÊM MỚI: TYPE CHO RATING ITEM ---
export type RatingItem = {
    id: string;
    sellProductId: string;
    profileImage: string | null;
    username: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
    status: number;
};

// --- CẬP NHẬT: TYPE CHO COMMENT ĐỂ KHỚP VỚI API ---
export type Comment = {
    id: string;
    sellProductId: string;
    profileImage: string | null;
    username: string;
    content: string; // Đổi từ 'text' thành 'content'
    createdAt: string; // Đổi từ 'timestamp' thành 'createdAt'
    updatedAt: string;
    status: number;
    // Bỏ các trường không có trong API mới như 'rating', 'author'
};

// --- THÊM MỚI: TYPES CHO EXCHANGE REQUEST ---

export type ExchangeProductInfo = {
    productExchangeId: string;
    quantityProductExchange: number;
    status: number;
    image: string | null;
    // Giả sử API sẽ trả về tên sản phẩm trong tương lai
    name?: string;
};

export type ExchangeRequestItem = {
    id: string;
    buyerId: string;
    itemReciveId: string; // ID vật phẩm của bạn
    iamgeItemRecive: string | null; // Ảnh vật phẩm của bạn
    itemGiveId: string; // ID vật phẩm của họ
    status: number; // 1: Pending, 2: Cancel, 3: Reject, 4: Finish
    datetime: string;
    isFeedback: boolean;
    products: ExchangeProductInfo[]; // Vật phẩm của họ
};

export type FeedbackItem = {
    id: string;
    userName: string;
    content: string;
    rating: number;
    createAt: string;
};

// Type này dùng để tổng hợp dữ liệu trong component
export type ProcessedExchangeRequest = ExchangeRequestItem & {
    requesterUsername: string;
    requesterProfileImage: string | null;
    feedback?: FeedbackItem[];
};

// --- THÊM MỚI: TYPES CHO CART ---

// Kiểu dữ liệu cho một sản phẩm trong giỏ hàng (từ API viewCart)
export type CartProductItem = {
    sellProductId: string;
    // product object bên trong có cấu trúc giống ProductOnSaleDetailItem
    product: ProductOnSaleDetailItem;
    quantity: number;
};

// Kiểu dữ liệu cho một box trong giỏ hàng (từ API viewCart)
export type CartBoxItem = {
    mangaBoxId: string;
    // box object bên trong có cấu trúc giống MysteryBoxItem
    box: MysteryBoxItem;
    quantity: number;
};

// Kiểu dữ liệu cho toàn bộ giỏ hàng
export type CartData = {
    products: CartProductItem[];
    boxes: CartBoxItem[];
};

// --- THÊM MỚI: TYPES CHO AUCTION DETAIL ---

// Dữ liệu sản phẩm trong phiên đấu giá (từ API python)
export type AuctionProduct = {
    _id: string;
    auction_session_id: string;
    user_product_id: string;
    seller_id: string;
    quantity: number;
    starting_price: number;
    current_price: number;
    status: number;
};

// Dữ liệu chi tiết của một sản phẩm (từ API get-product)
export type CollectionDetailItem = {
    productId: string;
    name: string;
    urlImage: string | null;
    description: string;
    rarityName: string;
};

// Dữ liệu tổng hợp để hiển thị trên màn hình
export type AuctionDetailData = {
    // Từ AuctionProduct
    auctionProductId: string;
    startingPrice: number;
    currentPrice: number;
    quantity: number;
    sellerId: string;
    // Từ CollectionDetailItem
    productName: string;
    productImageUrl: string | null;
    productRarity: string;
    description: string;
    sellerUsername: string;
    sellerProfileImage: string | null;
    auctionSessionId: string; // Thêm session id để dùng cho các API python
};

// --- THÊM MỚI: TYPES CHO BID HISTORY ---
// Giả định cấu trúc dựa trên nhu cầu hiển thị
export type BidHistoryItem = {
    _id: string; // ID của lượt bid
    user_id: string;
    username: string;
    price: number;
    created_at: string; // ISO date string
};
