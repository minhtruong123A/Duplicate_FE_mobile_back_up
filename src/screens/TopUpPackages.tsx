import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, Linking, ActivityIndicator, AppState } from 'react-native';
import { createPayment, checkTransactionStatus, ChangeTransactionStatus } from '../services/api.payOS';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNavigationProp } from '../types/types';

// Dữ liệu mới dựa trên hình ảnh, bỏ shortLabel không cần thiết cho giao diện cũ
const packages = [
    { id: '1', name: 'Quick Charge', amount: 25000 },
    { id: '2', name: 'Power Pack', amount: 59000 },
    { id: '3', name: 'Elite Scroll', amount: 79000 },
    { id: '4', name: 'Mythic Cache', amount: 129000 },
    { id: '5', name: 'Shogun\'s Trove', amount: 379000 },
    { id: '6', name: 'Artisan Ink', amount: 779000 },
    { id: '7', name: 'Dragon\'s Hoard', amount: 1299000 },
    { id: '8', name: 'Cosmic Bundle', amount: 2499000 },
];

// Định nghĩa kiểu cho một item trong package
type PackageItem = typeof packages[0];
const PENDING_ORDER_CODE_KEY = 'pendingOrderCode'; // Key để lưu vào AsyncStorage

export default function TopUpPackages() {
    const navigation = useNavigation<AppNavigationProp>();

    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [pendingOrderCode, setPendingOrderCode] = useState<string | null>(null);
    const [pollingStatus, setPollingStatus] = useState<string | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearTimeout(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setPendingOrderCode(null);
        setPollingStatus(null);
        AsyncStorage.removeItem(PENDING_ORDER_CODE_KEY);
    }, []);

    const pollStatus = useCallback(async (orderCode: string) => {
        // Thêm kiểm tra để đảm bảo polling không chạy nếu đã bị dừng
        if (!pollingIntervalRef.current) return;

        try {
            const response = await checkTransactionStatus(orderCode);
            if (response.status && response.data) {
                const currentStatus = response.data.status;
                setPollingStatus(currentStatus);

                if (['PAID', 'CANCELLED', 'EXPIRED'].includes(currentStatus)) {
                    if (pollingIntervalRef.current) {
                        clearTimeout(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                    }

                    setPollingStatus('Finalizing...');

                    try { await ChangeTransactionStatus(); } catch (e) { console.error(e); }
                    const message = currentStatus === 'PAID' ? 'Top-up successful!' : currentStatus === 'CANCELLED' ? 'Your transaction was cancelled.' : 'Your payment session has expired.';
                    Alert.alert("Transaction Update", message, [
                        {
                            text: "OK", onPress: () => {
                                stopPolling(); // Dọn dẹp state và AsyncStorage
                                navigation.navigate("MainTabs", { screen: "Payment", params: { screen: "Payment" } });
                            }
                        }]);
                } else {
                    pollingIntervalRef.current = setTimeout(() => pollStatus(orderCode), 5000);
                }
            } else {
                throw new Error(response.error || "Invalid response from status check");
            }
        } catch (error) {
            Alert.alert("Error", "Could not check transaction status. Polling stopped.");
            stopPolling();
        }
    }, [navigation, stopPolling]);

    const startPolling = useCallback((orderCode: string) => {
        if (pollingIntervalRef.current) return;
        setPendingOrderCode(orderCode);
        setPollingStatus('PENDING');
        pollingIntervalRef.current = setTimeout(() => pollStatus(orderCode), 1000);
    }, [pollStatus]);

    const checkForPendingTransaction = useCallback(async () => {
        if (pollingIntervalRef.current) return;
        try {
            const code = await AsyncStorage.getItem(PENDING_ORDER_CODE_KEY);
            if (code) {
                startPolling(code);
            }
        } catch (e) {
            console.error("Failed to check for pending transaction", e);
        }
    }, [startPolling]);

    // Lắng nghe sự kiện quay lại app từ background
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                checkForPendingTransaction();
            }
        });
        return () => {
            subscription.remove();
        };
    }, [checkForPendingTransaction]);

    // Dùng useFocusEffect chỉ để bắt đầu kiểm tra
    useFocusEffect(
        useCallback(() => {
            checkForPendingTransaction();
        }, [checkForPendingTransaction])
    );

    // SỬA LỖI: Dùng một useEffect riêng chỉ để dọn dẹp khi component bị unmount
    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);


    // --- Handlers ---
    const handlePackageSelect = async (item: PackageItem) => {
        if (loadingId || pendingOrderCode) {
            Alert.alert("Processing", "A previous transaction is still being processed. Please wait.");
            return;
        }
        setLoadingId(item.id);
        try {
            const response = await createPayment([{ name: item.name, price: item.amount }]);
            if (response.status && response.data?.checkoutUrl && response.data?.orderCode) {
                const { checkoutUrl, orderCode } = response.data;
                await AsyncStorage.setItem(PENDING_ORDER_CODE_KEY, orderCode.toString());
                await Linking.openURL(checkoutUrl);
            } else {
                throw new Error(response.error || "Failed to create payment link.");
            }
        } catch (error: any) {
            Alert.alert("Payment Error", error.message || "An unexpected error occurred.");
        } finally {
            setLoadingId(null);
        }
    };

    const renderItem = ({ item }: { item: PackageItem }) => {
        const isLoading = loadingId === item.id;
        const isDisabled = !!pendingOrderCode;
        return (
            <TouchableOpacity
                style={[styles.packageItem, isDisabled && styles.disabledItem]}
                onPress={() => handlePackageSelect(item)}
                disabled={isLoading || isDisabled}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#d9534f" />
                ) : (
                    <>
                        <Text style={styles.packageName}>{item.name}</Text>
                        <Text style={styles.packageAmount}>{item.amount.toLocaleString('vi-VN')} VND</Text>
                    </>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {pendingOrderCode && (
                <View style={styles.pollingStatusContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.pollingStatusText}>
                        Processing transaction... Status: {pollingStatus || 'Checking'}
                    </Text>
                </View>
            )}
            <FlatList
                data={packages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    listContent: {
        padding: 16,
    },
    packageItem: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        minHeight: 80, // Đảm bảo chiều cao không đổi khi loading
    },
    packageName: {
        fontSize: 18,
        fontFamily: 'Oxanium-SemiBold',
    },
    packageAmount: {
        fontSize: 18,
        fontFamily: 'Oxanium-Bold',
        color: '#d9534f',
    },
    disabledItem: {
        backgroundColor: '#e9ecef',
        opacity: 0.7,
    },
    pollingStatusContainer: {
        backgroundColor: '#6c757d',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pollingStatusText: {
        color: '#fff',
        fontFamily: 'Oxanium-SemiBold',
        marginLeft: 10,
    },
});
