import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Notification() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thông báo</Text>
            <Text style={styles.content}>Đây là màn hình thông báo.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    content: {
        fontSize: 16,
        color: '#666',
    },
});
