import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Svg, Path, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

// CẬP NHẬT: Import API và types thật
import { RootStackNavigationProp, TransactionItem, WhoAmIResponseData } from '../types/types';
import { getTransaction } from '../services/api.order'; // Giả sử API ở đây
import { fetchUserInfo } from '../services/api.auth'; // Giả sử API ở đây

// --- Component Tab Bar Tùy Chỉnh (Cập nhật để nhận props) ---
const CustomTabBar = ({ state, descriptors, navigation, totalReceived, totalSpent }: MaterialTopTabBarProps & { totalReceived: number, totalSpent: number }) => {
    return (
        <View style={styles.tabBarContainer}>
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
                        <TouchableOpacity key={route.key} onPress={onPress} style={[styles.tabButton, isFocused && styles.tabButtonActive]}>
                            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.totalsContainer}>
                <Text style={styles.totalText}>
                    Received: <Text style={styles.totalAmountReceived}>{totalReceived.toLocaleString('vi-VN')} đ</Text>
                </Text>
                <Text style={styles.totalText}>
                    Spent: <Text style={styles.totalAmountSpent}>{totalSpent.toLocaleString('vi-VN')} đ</Text>
                </Text>
            </View>
        </View>
    );
};

// --- Component hiển thị danh sách giao dịch ---
const getStatusStyle = (status: TransactionItem['status']) => {
    switch (status) {
        case 'Success': return { color: '#28a745', text: 'Success' };
        case 'Pending': return { color: '#ffc107', text: 'Pending' };
        case 'Cancel': return { color: '#dc3545', text: 'Cancelled' };
        default: return { color: '#6c757d', text: 'Unknown' };
    }
};

const TransactionHistoryScreen = ({ transactions }: { transactions: TransactionItem[] }) => {
    const renderItem = ({ item }: { item: TransactionItem }) => {
        const statusStyle = getStatusStyle(item.status);
        const date = new Date(item.dataTime).toLocaleString('vi-VN');

        return (
            <View style={styles.transactionItem}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.transactionType}>{item.type}</Text>
                    <Text style={styles.transactionDate}>{date}</Text>
                    <Text style={styles.transactionCode}>Code: {item.transactionCode}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.transactionAmount, { color: item.type === 'Recharge' ? '#dc3545' : '#28a745' }]}>
                        {item.type === 'Recharge' ? '-' : '+'} {item.amount.toLocaleString('vi-VN')} đ
                    </Text>
                    <Text style={[styles.transactionStatus, { color: statusStyle.color }]}>{statusStyle.text}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.historyContainer}>
            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={<Text style={styles.emptyText}>No transactions found.</Text>}
            />
        </View>
    );
};

const TopTab = createMaterialTopTabNavigator();

// --- Component chứa các Tab ---
function TransactionTabs({ receivedList, spentList, totalReceived, totalSpent }: {
    receivedList: TransactionItem[],
    spentList: TransactionItem[],
    totalReceived: number,
    totalSpent: number
}) {
    return (
        <TopTab.Navigator tabBar={props => <CustomTabBar {...props} totalReceived={totalReceived} totalSpent={totalSpent} />}>
            <TopTab.Screen name="Received" options={{ title: "Received" }}>
                {() => <TransactionHistoryScreen transactions={receivedList} />}
            </TopTab.Screen>
            <TopTab.Screen name="Spent" options={{ title: "Spent" }}>
                {() => <TransactionHistoryScreen transactions={spentList} />}
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


// --- Component chính của màn hình ---
export default function Payment() {
    const navigation = useNavigation<RootStackNavigationProp>();

    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [userInfoResponse, transactionData] = await Promise.all([
                    fetchUserInfo(),
                    getTransaction(),
                ]);

                if (userInfoResponse.status && userInfoResponse.data) {
                    setBalance(userInfoResponse.data.wallet_amount);
                }

                if (Array.isArray(transactionData)) {
                    setTransactions([...transactionData].reverse());
                }

                setError(null);
            } catch (err: any) {
                setError("Failed to load payment data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const { totalReceived, totalSpent, receivedList, spentList } = useMemo(() => {
        const successfulTransactions = transactions.filter(t => t.status === 'Success');

        const totalReceived = successfulTransactions
            .filter(t => t.type === 'Withdraw')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalSpent = successfulTransactions
            .filter(t => t.type === 'Recharge')
            .reduce((sum, t) => sum + t.amount, 0);

        // LƯU Ý: API của bạn không có type 'Withdraw', nên receivedList có thể sẽ luôn rỗng
        const receivedList = transactions.filter(t => t.type === 'Withdraw');
        const spentList = transactions.filter(t => t.type === 'Recharge');

        return { totalReceived, totalSpent, receivedList, spentList };
    }, [transactions]);

    if (loading) {
        return <SafeAreaView style={styles.centerContainer}><ActivityIndicator size="large" color="#d9534f" /></SafeAreaView>;
    }

    if (error) {
        return <SafeAreaView style={styles.centerContainer}><Text style={{ color: 'red' }}>{error}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceAmount}>{balance.toLocaleString('vi-VN')} VND</Text>
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('TopUpPackages')}>
                        <TopUpIcon />
                        <Text style={styles.actionButtonText}>Top Up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('WithdrawRequest')}>
                        <WithdrawIcon />
                        <Text style={styles.actionButtonText}>Withdraw</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TransactionTabs
                receivedList={receivedList}
                spentList={spentList}
                totalReceived={totalReceived}
                totalSpent={totalSpent}
            />
        </SafeAreaView>
    );
}


// ... (styles cũ)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    balanceContainer: {
        backgroundColor: '#5cb85c',
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
        backgroundColor: '#f0f2f5'
    },
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
        color: '#28a745',
    },
    totalAmountSpent: {
        fontFamily: 'Oxanium-Bold',
        color: '#dc3545',
    },
    transactionItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    transactionType: {
        fontFamily: 'Oxanium-Bold',
        fontSize: 16,
    },
    transactionDate: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 12,
        color: '#666',
        marginVertical: 2,
    },
    transactionCode: {
        fontFamily: 'Oxanium-Regular',
        fontSize: 12,
        color: '#aaa',
    },
    transactionAmount: {
        fontFamily: 'Oxanium-Bold',
        fontSize: 16,
        marginBottom: 4,
    },
    transactionStatus: {
        fontFamily: 'Oxanium-Bold',
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontFamily: 'Oxanium-Regular',
        color: '#888',
    }
});