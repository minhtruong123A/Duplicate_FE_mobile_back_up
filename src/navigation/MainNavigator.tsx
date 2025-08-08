// src/navigation/MainNavigator.tsx

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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

// Types
import {
    RootTabParamList,
    ShopStackParamList,
    PaymentStackParamList,
} from '../types/types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ShopStackNav = createNativeStackNavigator<ShopStackParamList>();
const PaymentStackNav = createNativeStackNavigator<PaymentStackParamList>();

// --- Navigators con ---

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
            <Tab.Screen name="Auction" component={Auction} />
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
});
