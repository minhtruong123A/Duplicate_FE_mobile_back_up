// src/components/MainLayout.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from './CustomHeader';

//not used anymore


export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 }, // phần còn lại dưới header
});
