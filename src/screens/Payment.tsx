// src/screens/Payment.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Svg, Path, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/types';

// --- Dữ liệu giả cho tổng tiền ---
const MOCK_TOTALS = {
    received: 1500000,
    spent: 450000,
};

// --- Component Tab Bar Tùy Chỉnh ---
const CustomTabBar = ({ state, descriptors, navigation }: MaterialTopTabBarProps) => {
    return (
        <View style={styles.tabBarContainer}>
            {/* Phần chứa các nút tab (bên trái) */}
            <View style={styles.tabButtonsContainer}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.title !== undefined ? options.title : route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={[styles.tabButton, isFocused && styles.tabButtonActive]}
                        >
                            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Phần hiển thị tổng tiền (bên phải) */}
            <View style={styles.totalsContainer}>
                <Text style={styles.totalText}>
                    Received: <Text style={styles.totalAmountReceived}>{MOCK_TOTALS.received.toLocaleString('vi-VN')}vnd</Text>
                </Text>
                <Text style={styles.totalText}>
                    Spent: <Text style={styles.totalAmountSpent}>{MOCK_TOTALS.spent.toLocaleString('vi-VN')}vnd</Text>
                </Text>
            </View>
        </View>
    );
};


// --- Các Component và Màn Hình Chính ---

const TransactionHistoryScreen = ({ type }: { type: 'received' | 'spent' }) => (
    <View style={styles.historyContainer}>
        <Text>Transaction History {type === 'received' ? 'received' : 'spent'}.</Text>
    </View>
);

const TopTab = createMaterialTopTabNavigator();

function TransactionTabs() {
    return (
        // Sử dụng tabBar tùy chỉnh
        <TopTab.Navigator tabBar={props => <CustomTabBar {...props} />}>
            <TopTab.Screen name="Received" options={{ title: "received" }}>
                {() => <TransactionHistoryScreen type="received" />}
            </TopTab.Screen>
            <TopTab.Screen name="Spent" options={{ title: "spent" }}>
                {() => <TransactionHistoryScreen type="spent" />}
            </TopTab.Screen>
        </TopTab.Navigator>
    );
}

// --- Icons ---
const TopUpIcon = (props: any) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Rect x={2} y={5} width={20} height={14} rx={2} stroke="#fff" strokeWidth={2} />
        <Path d="M2 10h20M6 14h4" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const WithdrawIcon = (props: any) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function Payment() {
    const navigation = useNavigation<RootStackNavigationProp>();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceAmount}>5,400,000 VND</Text>
                {/* CẬP NHẬT: Thêm hàng chứa 2 nút */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('TopUpPackages')}
                    >
                        <TopUpIcon />
                        <Text style={styles.actionButtonText}>Top Up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('WithdrawRequest')}
                    >
                        <WithdrawIcon />
                        <Text style={styles.actionButtonText}>Withdraw</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TransactionTabs />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    balanceContainer: {
        backgroundColor: '#d9534f',
        padding: 24,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 16,
        fontFamily: 'Oxanium-Regular',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    balanceAmount: {
        fontSize: 40,
        fontFamily: 'Oxanium-Bold',
        color: '#fff',
        marginVertical: 8,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginHorizontal: 8,
    },
    actionButtonText: {
        fontSize: 16,
        fontFamily: 'Oxanium-Bold',
        color: '#fff',
        marginLeft: 8,
    },
    historyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5'
    },
    // Styles for Custom Tab Bar
    tabBarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabButtonsContainer: {
        flexDirection: 'row',
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginRight: 16,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        borderBottomColor: '#d9534f',
    },
    tabLabel: {
        fontFamily: 'Oxanium-SemiBold',
        fontSize: 16,
        color: 'gray',
    },
    tabLabelActive: {
        color: '#d9534f',
    },
    totalsContainer: {
        alignItems: 'flex-end',
    },
    totalText: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 12,
        color: '#666',
    },
    totalAmountReceived: {
        fontFamily: 'Oxanium-Bold',
        color: '#28a745', // Xanh lá
    },
    totalAmountSpent: {
        fontFamily: 'Oxanium-Bold',
        color: '#dc3545', // Đỏ
    },
});
