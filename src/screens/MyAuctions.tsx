// src/screens/MyAuctions.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const MyAuctions = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Text>Danh sách các phiên đấu giá của bạn sẽ hiển thị ở đây.</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
    },
});

export default MyAuctions;
