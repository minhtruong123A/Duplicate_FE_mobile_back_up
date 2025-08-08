// src/screens/Chat.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/types';

// Dữ liệu mẫu
const friendsData = [
    { id: '1', name: 'Alice', lastMessage: 'Hẹn gặp bạn sau nhé!', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Bob', lastMessage: 'Ok, đã nhận được.', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Charlie', lastMessage: 'Bạn đang làm gì vậy?', avatar: 'https://i.pravatar.cc/150?img=3' },
];

export default function Chat() {
    const navigation = useNavigation<RootStackNavigationProp>();

    const renderFriendItem = ({ item }: { item: typeof friendsData[0] }) => (
        <TouchableOpacity
            style={styles.friendItemContainer}
            onPress={() => navigation.navigate('Chatbox', { userName: item.name, avatarUrl: item.avatar })}
        >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.friendTextContainer}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Tin nhắn</Text>
                <FlatList
                    data={friendsData}
                    renderItem={renderFriendItem}
                    keyExtractor={item => item.id}
                    style={styles.list}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    title: { fontSize: 28, fontWeight: 'bold', margin: 16, marginTop: 20 },
    list: { flex: 1 },
    friendItemContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
    friendTextContainer: { flex: 1, justifyContent: 'center' },
    friendName: { fontSize: 16, fontWeight: 'bold' },
    lastMessage: { fontSize: 14, color: '#666', marginTop: 2 },
});
