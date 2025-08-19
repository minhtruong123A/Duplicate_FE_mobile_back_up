import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// --- Types, APIs, Components ---
import { AppNavigationProp, UserProfile } from '../types/types';
import { getUserInChat } from '../services/api.chat'; // Giả sử API chat ở đây
import { getOtherProfile } from '../services/api.user';
import { useAuth } from '../context/AuthContext';
import ApiImage from '../components/ApiImage';

// --- Type Definitions ---
// Dữ liệu cho một cuộc trò chuyện từ API
type ConversationItem = {
    _id: string;
    participant_1: string;
    participant_2: string;
};

// Dữ liệu đã được xử lý để hiển thị
type ChatListItem = {
    conversationId: string;
    otherUser: UserProfile;
};

export default function Chat() {
    const navigation = useNavigation<AppNavigationProp>();
    const { user: currentUser } = useAuth(); // Lấy thông tin người dùng hiện tại

    // --- State Management ---
    const [conversations, setConversations] = useState<ChatListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        if (!currentUser) return;

        // Chỉ hiện loading toàn màn hình lần đầu
        if (conversations.length === 0) {
            setLoading(true);
        }

        try {
            const response = await getUserInChat();
            if (response.success && Array.isArray(response.data[0])) {
                const rawConversations: ConversationItem[] = response.data[0];

                // Lấy thông tin profile của người còn lại trong mỗi cuộc trò chuyện
                const processedConversations = await Promise.all(
                    rawConversations.map(async (convo) => {
                        // Xác định ID của người còn lại
                        const otherParticipantId = convo.participant_1 === currentUser.id
                            ? convo.participant_2
                            : convo.participant_1;

                        try {
                            const profileRes = await getOtherProfile(otherParticipantId);
                            if (profileRes.status && profileRes.data) {
                                return {
                                    conversationId: convo._id,
                                    otherUser: profileRes.data,
                                };
                            }
                        } catch (e) {
                            console.error(`Failed to fetch profile for ${otherParticipantId}`, e);
                        }
                        return null; // Bỏ qua nếu không lấy được profile
                    })
                );

                // Lọc ra các kết quả không null
                setConversations(processedConversations.filter(Boolean) as ChatListItem[]);
            } else {
                throw new Error(response.error || "Failed to load conversations.");
            }
            setError(null);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // SỬA LỖI: Bọc lời gọi fetchData trong useCallback
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // --- Render Logic ---
    const renderFriendItem = ({ item }: { item: ChatListItem }) => (
        <TouchableOpacity
            style={styles.friendItemContainer}
            onPress={() => navigation.navigate('Chatbox', {
                userName: item.otherUser.username,
                avatarUrl: item.otherUser.profileImage || '',
                otherUserId: item.otherUser.id // <-- Thêm dòng này vào
            })}
        >
            <ApiImage urlPath={item.otherUser.profileImage} style={styles.avatar} />
            <View style={styles.friendTextContainer}>
                <Text style={styles.friendName}>{item.otherUser.username}</Text>
                {/* LƯU Ý: API không trả về tin nhắn cuối, ta để một placeholder */}
                <Text style={styles.lastMessage}>Click to start chatting...</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#d9534f" /></SafeAreaView>;
    }

    if (error) {
        return <SafeAreaView style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Messages</Text>
                <FlatList
                    data={conversations}
                    renderItem={renderFriendItem}
                    keyExtractor={item => item.conversationId}
                    style={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>You have no conversations yet.</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
    title: { fontSize: 28, fontFamily: 'Oxanium-Bold', margin: 16, marginTop: 20 },
    list: { flex: 1 },
    friendItemContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#eee' },
    friendTextContainer: { flex: 1, justifyContent: 'center' },
    friendName: { fontSize: 16, fontFamily: 'Oxanium-Bold' },
    lastMessage: { fontSize: 14, color: '#666', marginTop: 2, fontFamily: 'Oxanium-Regular' },
    emptyText: {
        fontFamily: 'Oxanium-Regular',
        color: '#888',
        fontSize: 16,
    }
});
