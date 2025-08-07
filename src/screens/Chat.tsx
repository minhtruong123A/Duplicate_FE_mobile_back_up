import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootTabNavigationProp } from '../types/types';

// Dữ liệu mẫu (sau này bạn sẽ thay bằng dữ liệu thật từ API)
const friendsData = [
    { id: '1', name: 'Alice', lastMessage: 'Hẹn gặp bạn sau nhé!', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Bob', lastMessage: 'Ok, đã nhận được.', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Charlie', lastMessage: 'Bạn đang làm gì vậy?', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: '4', name: 'David', lastMessage: 'Tuyệt vời!', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: '5', name: 'Eve', lastMessage: 'Cảm ơn bạn nhiều.', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: '6', name: 'Frank', lastMessage: 'Tôi sẽ gửi cho bạn ngay.', avatar: 'https://i.pravatar.cc/150?img=6' },
];

export default function Chat() {
    const navigation = useNavigation<RootTabNavigationProp>();

    // Hàm để render mỗi item trong danh sách
    const renderFriendItem = ({ item }: { item: typeof friendsData[0] }) => (
        <TouchableOpacity style={styles.friendItemContainer} onPress={() => alert(`Mở chat với ${item.name}`)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.friendTextContainer}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        // SafeAreaView để đảm bảo nội dung không bị che bởi tai thỏ hoặc các thanh hệ thống
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
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        margin: 16,
        marginTop: 20,
    },
    list: {
        flex: 1,
    },
    friendItemContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    friendTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    friendName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
});
