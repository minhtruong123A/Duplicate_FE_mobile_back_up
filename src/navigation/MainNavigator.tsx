// src/navigation/MainNavigator.tsx

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';

// Icons
import ShopIcon from '../../assets/icons/shop.svg';
import ShopIconOutline from '../../assets/icons/shop-outline.svg';
import AuctionIcon from '../../assets/icons/auction.svg';
import AuctionIconOutline from '../../assets/icons/auction_outline.svg';
import PaymentIcon from '../../assets/icons/payment.svg';
import PaymentIconOutline from '../../assets/icons/payment_outline.svg';
import ChatIcon from '../../assets/icons/chat.svg';
import ChatIconOutline from '../../assets/icons/chat-outline.svg';

// Components
import CustomHeader from '../components/CustomHeader';

// Screens
import Shop from '../screens/Shop';
import BoxDetail from '../screens/BoxDetail';
import ProductDetail from '../screens/ProductDetail';
import Auction from '../screens/Auction';
import Payment from '../screens/Payment';
import WithdrawRequest from '../screens/WithdrawRequest';
import Chat from '../screens/Chat';
import OngoingAuctions from '../screens/OngoingAuctions'; // Import màn hình danh sách
import AuctionDetail from '../screens/AuctionDetail';
import AddAuction from '../screens/AddAuction'; // Giả sử bạn có màn hình này
import { Svg, Path } from 'react-native-svg';

// Types
import {
    RootTabParamList,
    ShopStackParamList,
    PaymentStackParamList,
    AuctionStackParamList,
    AppNavigationProp // SỬA LỖI: Import type chung
} from '../types/types';

const AddIcon = (props: any) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 5v14m-7-7h14" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const Tab = createBottomTabNavigator<RootTabParamList>();
const ShopStackNav = createNativeStackNavigator<ShopStackParamList>();
const PaymentStackNav = createNativeStackNavigator<PaymentStackParamList>();

// --- Navigators con ---
const AuctionStackNav = createNativeStackNavigator<AuctionStackParamList>(); // Dùng type mới
function AuctionStack() {
    return (
        <AuctionStackNav.Navigator screenOptions={{ headerShown: false }}>
            {/* SỬA Ở ĐÂY:
                Màn hình chính của Stack này là component Auction.tsx (chứa các tab).
                Tên "AuctionTabs" phải khớp với tên trong AuctionStackParamList bạn vừa định nghĩa.
            */}
            <AuctionStackNav.Screen name="AuctionTabs" component={Auction} />

            {/* Màn hình chi tiết vẫn giữ nguyên */}
            <AuctionStackNav.Screen name="AuctionDetail" component={AuctionDetail} />
        </AuctionStackNav.Navigator>
    );
}


function ShopStack() {
    return (
        <ShopStackNav.Navigator screenOptions={{ headerShown: false }}>
            <ShopStackNav.Screen name="Shop" component={Shop} />
            <ShopStackNav.Screen name="Box Detail" component={BoxDetail} />
            <ShopStackNav.Screen name="Collection Detail" component={ProductDetail} />
        </ShopStackNav.Navigator>
    );
}

function PaymentStack() {
    return (
        <PaymentStackNav.Navigator screenOptions={{ headerShown: false }}>
            <PaymentStackNav.Screen name="Payment" component={Payment} />
            <PaymentStackNav.Screen name="WithdrawRequest" component={WithdrawRequest} />
        </PaymentStackNav.Navigator>
    )
}

// --- Component chính: MainTabs ---

export default function MainTabs() {
    const navigation = useNavigation<AppNavigationProp>();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                header: () => <CustomHeader />,
                headerShown: true,
                tabBarActiveTintColor: '#d9534f',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIcon: ({ focused, size }) => {
                    let IconComponent;
                    if (route.name === 'Shop') {
                        IconComponent = focused ? ShopIcon : ShopIconOutline;
                    } else if (route.name === 'Auction') {
                        IconComponent = focused ? AuctionIcon : AuctionIconOutline;
                    } else if (route.name === 'Payment') {
                        IconComponent = focused ? PaymentIcon : PaymentIconOutline;
                    } else if (route.name === 'Chat') {
                        IconComponent = focused ? ChatIcon : ChatIconOutline;
                    }

                    if (!IconComponent) return null;
                    return <IconComponent width={size} height={size} />;
                },
            })}
        >
            <Tab.Screen name="Shop" component={ShopStack} />
            {/* <Tab.Screen name="Auction" component={Auction} /> */}
            <Tab.Screen name="Auction" component={AuctionStack} />
            {/* NÚT BẤM MỚI Ở GIỮA */}
            <Tab.Screen
                name="AddAuctionTab"
                component={() => null}
                options={{
                    tabBarLabel: () => null,
                    tabBarButton: () => (
                        <TouchableOpacity
                            style={styles.fabContainer}
                            onPress={() => navigation.navigate('AddAuction')}
                        >
                            <View style={styles.fab}>
                                <AddIcon width={30} height={30} />
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />
            <Tab.Screen name="Payment" component={PaymentStack} />
            <Tab.Screen name="Chat" component={Chat} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabBar: {
        height: 90,
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderTopColor: '#ccc',
        paddingTop: 5,
        paddingBottom: 30,
    },
    tabBarLabel: {
        fontFamily: 'Oxanium-SemiBold',
        fontSize: 12,
    },
    // THÊM CÁC STYLE MỚI CHO NÚT ADD
    fabContainer: {
        top: -10, // Đẩy nút lên trên
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#d9534f',
        justifyContent: 'center',
        alignItems: 'center',
        // elevation: 8,
        // shadowColor: '#000',
        // shadowOpacity: 0.3,
        // shadowRadius: 4,
        // shadowOffset: { width: 0, height: 2 },
    },
});
