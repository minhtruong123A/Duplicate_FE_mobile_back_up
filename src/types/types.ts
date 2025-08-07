import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';


// (A) Type cho Stack lồng trong Tab "Shop"
export type ShopStackParamList = {
    Shop: undefined; // Màn hình gốc của Shop Stack
    'Mystery Box': undefined;
    'Box Detail': { boxId: string };
    'Collection Store': undefined;
    'Collection Detail': { productId: string };
};

// (B) Type cho Stack lồng trong Tab "Cart"
export type CartStackParamList = {
    Cart: undefined;
    Favorite: undefined;
};

// THÊM MỚI: Type cho Stack lồng trong Tab "Settings"
export type SettingsStackParamList = {
    Settings: undefined;
    Profile: undefined;
    UpdateProfile: undefined;
};


// (C) Cập nhật RootTabParamList
// Thay vì `Shop: undefined`, chúng ta báo cho nó biết "Shop" chứa cả một Stack Navigator
export type RootTabParamList = {
    Shop: NavigatorScreenParams<ShopStackParamList>; // <-- Thay đổi ở đây
    Auction: undefined;
    Cart: NavigatorScreenParams<CartStackParamList>; // <-- Thay đổi ở đây
    Chat: undefined;
    Notification: undefined;
    Settings: undefined;
    // Bạn không cần Favorite và Profile ở đây nữa vì chúng đã nằm trong các Stack khác
};


// (D) Export sẵn các Type cho từng màn hình để dễ sử dụng
// -- Props cho các màn hình trong Tab Navigator --
export type ShopTabProps = CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, 'Shop'>,
    NativeStackScreenProps<ShopStackParamList>
>;

// -- Props cho các màn hình trong Shop Stack --
export type ShopScreenProps = NativeStackScreenProps<ShopStackParamList, 'Shop'>;
export type BoxDetailScreenProps = NativeStackScreenProps<ShopStackParamList, 'Box Detail'>;
// ... tương tự cho các màn hình khác trong ShopStack

// THÊM DÒNG NÀY VÀO CUỐI FILE
export type RootTabNavigationProp = BottomTabNavigationProp<RootTabParamList>;

// (E) Root Stack ngoài cùng chứa Tab + Chat
export type RootStackParamList = {
    MainTabs: NavigatorScreenParams<RootTabParamList>; // Tab chứa Shop, Cart, v.v.
    Chat: undefined; // Màn hình Chat riêng, không nằm trong Tab
};