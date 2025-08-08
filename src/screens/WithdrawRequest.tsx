// src/screens/WithdrawRequest.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, Keyboard } from 'react-native';
import { RootStackScreenProps } from '../types/types';

const CURRENT_BALANCE = 5400000; // Dữ liệu giả, sau này sẽ được truyền qua params

export default function WithdrawRequest({ navigation }: RootStackScreenProps<'WithdrawRequest'>) {
    const [amount, setAmount] = useState('');

    const handleRequestSubmit = () => {
        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            Alert.alert("Error", "Please enter a valid amount.");
            return;
        }
        if (withdrawAmount > CURRENT_BALANCE) {
            Alert.alert("Error", "Amount exceeds current balance.");
            return;
        }

        Keyboard.dismiss();
        Alert.alert(
            "Confirm Request",
            `Are you sure you want to request a withdrawal of ${withdrawAmount.toLocaleString('vi-VN')} đ?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: () => {
                        console.log(`Withdrawal request for ${withdrawAmount}`);
                        // Logic gửi request lên server ở đây
                        navigation.goBack();
                        Alert.alert("Success", "Your withdrawal request has been sent. Please wait for it to be processed.");
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Withdraw Funds</Text>
                <Text style={styles.balanceInfo}>
                    Max withdrawal:
                    <Text style={styles.balanceAmount}> {CURRENT_BALANCE.toLocaleString('vi-VN')} đ</Text>
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount to withdraw"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleRequestSubmit}>
                    <Text style={styles.submitButtonText}>Send Request</Text>
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
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'Oxanium-Bold',
    },
});
