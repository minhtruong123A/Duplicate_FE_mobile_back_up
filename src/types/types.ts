// src/types/types.ts

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';

// CẬP NHẬT: Thêm AuthStack và thay đổi RootStack
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

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
    Profile: undefined;
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
