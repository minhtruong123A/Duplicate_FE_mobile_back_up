import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, Keyboard, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// --- Types, APIs, Components ---
import { RootStackScreenProps, AppNavigationProp } from '../types/types';
import { fetchUserInfo } from '../services/api.auth'; // API để lấy số dư
import { createWithdrawTransaction } from '../services/api.user'; // API để tạo yêu cầu rút tiền
import { useAuth } from '../context/AuthContext'; // THÊM MỚI

export default function WithdrawRequest() {
    // Sửa lại để dùng AppNavigationProp cho phép điều hướng rộng hơn
    const navigation = useNavigation<AppNavigationProp>();
    const { isAuctionJoined } = useAuth();

    // --- State Management ---
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true); // State để tải số dư ban đầu
    const [isSubmitting, setIsSubmitting] = useState(false); // State cho việc gửi request

    // --- Data Fetching ---
    // Dùng useEffect để tải số dư khi vào màn hình
    useEffect(() => {
        const loadBalance = async () => {
            try {
                setLoading(true);
                const response = await fetchUserInfo();
                if (response.status && typeof response.data?.wallet_amount === 'number') {
                    setBalance(response.data.wallet_amount);
                } else {
                    throw new Error("Could not fetch balance.");
                }
            } catch (error) {
                Alert.alert("Error", "Failed to load your current balance. Please try again later.");
                navigation.goBack(); // Quay về nếu không tải được số dư
            } finally {
                setLoading(false);
            }
        };
        loadBalance();
    }, []);

    // --- Handlers ---
    const handleRequestSubmit = async () => {
        console.log(`[AuthContext] Trạng thái đấu giá toàn cục hiện tại: ${isAuctionJoined}`);
        if (isAuctionJoined) {
            Alert.alert(
                "Action Disabled",
                "You cannot request a withdrawal while participating in an auction."
            );
            return;
        }

        if (isSubmitting) return;
        const withdrawAmount = parseFloat(amount);

        // --- Validation Logic ---
        if (isNaN(withdrawAmount)) {
            Alert.alert("Invalid Input", "Please enter a valid number.");
            return;
        }
        if (withdrawAmount < 1000) {
            Alert.alert("Invalid Amount", "Withdrawal amount must be at least 1,000 đ.");
            return;
        }
        if (balance !== null && withdrawAmount > balance) {
            Alert.alert("Insufficient Funds", "Amount exceeds your current balance.");
            return;
        }

        Keyboard.dismiss();

        // --- API Call Logic ---
        setIsSubmitting(true);
        try {
            const response = await createWithdrawTransaction(withdrawAmount);

            // Case 1: Thành công
            if (response && response.status) {
                Alert.alert("Success", "Your withdrawal request has been sent. Please wait for it to be processed.", [
                    { text: "OK", onPress: () => navigation.navigate("MainTabs", { screen: "Payment", params: { screen: "Payment" } }) }
                ]);
            }
            // Case 2: Lỗi logic từ server (ví dụ: chưa có tài khoản ngân hàng)
            else if (response && !response.status && response.error) {
                if (response.error.toLowerCase().includes("bank account")) {
                    Alert.alert(
                        "Bank Account Required",
                        "You must add a bank account before requesting a withdrawal.",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Add Bank Info", onPress: () => navigation.navigate('UpdateProfile') }
                        ]
                    );
                } else {
                    // Các lỗi logic khác
                    throw new Error(response.error);
                }
            }
            // Case 3: Lỗi không xác định
            else {
                throw new Error("An unknown error occurred.");
            }
        } catch (error: any) {
            Alert.alert("Request Failed", error.message || "Could not submit your request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#d9534f" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Withdraw Funds</Text>
                <Text style={styles.balanceInfo}>
                    Max withdrawal:
                    <Text style={styles.balanceAmount}> {(balance ?? 0).toLocaleString('vi-VN')} VND</Text>
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount to withdraw"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />
                {/* CẬP NHẬT: Vô hiệu hóa nút nếu đang tham gia đấu giá */}
                <TouchableOpacity
                    style={[styles.submitButton, (isSubmitting || isAuctionJoined) && styles.disabledButton]}
                    onPress={handleRequestSubmit}
                    disabled={isSubmitting || isAuctionJoined}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Send Request</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Oxanium-Bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    balanceInfo: {
        fontSize: 16,
        fontFamily: 'Oxanium-Regular',
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    balanceAmount: {
        fontFamily: 'Oxanium-Bold',
        color: '#28a745',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        fontSize: 18,
        fontFamily: 'Oxanium-Regular',
        marginBottom: 20,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#d9534f',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        minHeight: 58, // Đảm bảo chiều cao không đổi khi loading
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Oxanium-Bold',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});
