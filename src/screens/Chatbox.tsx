import React, { useState, useCallback, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

// --- Types, APIs, Components ---
import { RootStackScreenProps, ChatMessage, AppNavigationProp } from '../types/types';
import { useAuth } from '../context/AuthContext';
import { createConversationsByUserId, getMessages } from '../services/api.chat';
import ChatSocket from '../config/ChatSocket';
import { PYTHON_API_BASE_URL } from '../config/axios';
import ApiImage from '../components/ApiImage';


const SendIcon = (props: any) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);
//onPress={() => navigation.navigate('SellerProfile', { sellerId: product.userId })}
// --- Component Header Tùy chỉnh ---
// CẬP NHẬT: Thêm prop onPress và bọc trong TouchableOpacity
const ChatHeader = ({ userName, avatarUrl, onPress }: { userName: string, avatarUrl: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.headerContainer} onPress={onPress}>
        <ApiImage urlPath={avatarUrl} style={styles.headerAvatar} />
        <Text style={styles.headerTitle}>{userName}</Text>
    </TouchableOpacity>
);

// --- Helper Function mới để định dạng thời gian ---
const formatTimestamp = (dateString: string) => {
    const now = new Date();
    const msgDate = new Date(dateString);

    if (isNaN(msgDate.getTime())) {
        return '';
    }

    const isToday = now.getFullYear() === msgDate.getFullYear() &&
        now.getMonth() === msgDate.getMonth() &&
        now.getDate() === msgDate.getDate();

    const isThisYear = now.getFullYear() === msgDate.getFullYear();

    // Luôn lấy phần giờ:phút
    const timeString = msgDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
        // Nếu là hôm nay, chỉ trả về giờ
        return timeString;
    } else if (isThisYear) {
        // Nếu là năm nay (nhưng khác ngày), trả về giờ, ngày/tháng
        const datePart = msgDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        return `${timeString}, ${datePart}`;
    } else {
        // Nếu là năm khác, trả về giờ, ngày/tháng/năm
        const datePart = msgDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${timeString}, ${datePart}`;
    }
};

export default function Chatbox({ route }: RootStackScreenProps<'Chatbox'>) {
    const { otherUserId, userName, avatarUrl } = route.params;
    const navigation = useNavigation<AppNavigationProp>();
    const { user: currentUser, userToken } = useAuth();

    // --- State Management ---
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
    const socketRef = useRef<ChatSocket | null>(null);
    const isInitializingRef = useRef(false);
    const [visibleTimestampId, setVisibleTimestampId] = useState<string | null>(null);

    // CẬP NHẬT: Dùng useLayoutEffect để cập nhật header trước khi màn hình được vẽ
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <ChatHeader
                    userName={userName}
                    avatarUrl={avatarUrl}
                    onPress={() => navigation.navigate('SellerProfile', { sellerId: otherUserId })}
                />
            ),
        });
    }, [navigation, userName, avatarUrl]);

    // --- Data Fetching & WebSocket Connection ---
    useEffect(() => {
        if (!currentUser || !userToken || !otherUserId) {
            setError("Missing required information to start chat.");
            setLoading(false);
            return;
        }

        const initializeChat = async () => {
            if (isInitializingRef.current) return;
            isInitializingRef.current = true;

            try {
                const convoRes = await createConversationsByUserId(otherUserId);
                if (!convoRes.success || !convoRes.data?.[0]) {
                    throw new Error("Could not initialize conversation.");
                }
                const conversationId = convoRes.data[0];

                const messagesRes = await getMessages(conversationId, 0, 50);

                if (messagesRes.success && Array.isArray(messagesRes.data?.[0])) {
                    setMessages(messagesRes.data[0].reverse());
                } else {
                    setMessages([]);
                    console.warn("getMessages did not return a valid data array.");
                }

                if (socketRef.current) socketRef.current.close();
                const socket = new ChatSocket({
                    urlBase: PYTHON_API_BASE_URL,
                    token: userToken,
                    conversationId: conversationId,
                    userId: currentUser.id,
                    debug: true,
                    reconnect: true,
                });

                socket.onopen = () => setConnectionStatus('connected');
                socket.onclose = () => setConnectionStatus('disconnected');
                socket.onerror = () => setConnectionStatus('error');

                // SỬA LỖI: Thêm ID tạm thời cho tin nhắn đến
                socket.onmessage = (newMessage: Omit<ChatMessage, '_id'>) => {
                    if (newMessage.sender_id !== currentUser.id) {
                        const messageWithId: ChatMessage = {
                            ...newMessage,
                            _id: `ws-${Date.now()}-${Math.random()}`, // Tạo ID tạm thời, duy nhất
                        };
                        setMessages(previousMessages => [messageWithId, ...previousMessages]);
                    }
                };

                socketRef.current = socket;
            } catch (err: any) {
                setError(err.message || "Failed to load chat.");
            } finally {
                setLoading(false);
                isInitializingRef.current = false;
            }
        };

        initializeChat();

        return () => {
            console.log("Closing chat socket...");
            socketRef.current?.close();
        };
    }, [currentUser, userToken, otherUserId]);

    const onSend = () => {
        if (input.trim().length > 0 && socketRef.current) {
            const sent = socketRef.current.send(input);

            if (sent) {
                const myMessage: ChatMessage = {
                    _id: `local-${Date.now()}`,
                    content: input,
                    sender_id: currentUser!.id,
                    conversation_id: (socketRef.current as any).conversationId,
                    created_at: new Date().toISOString(),
                };
                setMessages(previousMessages => [myMessage, ...previousMessages]);
                setInput('');
            } else {
                Alert.alert("Connection Error", "Could not send message. Please check your connection.");
            }
        }
    };

    const processedMessages = useMemo(() => {
        return messages.map((msg, index) => {
            const isMyMessage = msg.sender_id === currentUser?.id;
            const prevMessage = messages[index + 1];
            const showSenderInfo = !isMyMessage && (!prevMessage || prevMessage.sender_id === currentUser?.id);
            return { ...msg, showSenderInfo };
        });
    }, [messages, currentUser]);


    const renderItem = ({ item }: { item: ChatMessage & { showSenderInfo: boolean } }) => {
        const isMyMessage = item.sender_id === currentUser?.id;

        return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => setVisibleTimestampId(prevId => prevId === item._id ? null : item._id)}>
                {/* CẬP NHẬT: Sử dụng hàm formatTimestamp mới */}
                {visibleTimestampId === item._id && (
                    <Text style={styles.timestampText}>
                        {formatTimestamp(item.created_at)}
                    </Text>
                )}

                <View style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.theirMessageRow]}>
                    {!isMyMessage && item.showSenderInfo && (
                        <ApiImage urlPath={avatarUrl} style={styles.messageAvatar} />
                    )}

                    <View style={[
                        styles.messageBubble,
                        isMyMessage ? styles.myMessage : styles.theirMessage,
                        !isMyMessage && !item.showSenderInfo && { marginLeft: 42 }
                    ]}>
                        <Text style={[styles.messageText, isMyMessage ? { color: '#fff' } : { color: '#000' }]}>{item.content}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#d9534f" /></SafeAreaView>;
    }
    if (error) {
        return <SafeAreaView style={styles.container}><Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {connectionStatus !== 'connected' && (
                    <View style={[styles.statusBanner, connectionStatus === 'error' && { backgroundColor: '#dc3545' }]}>
                        <Text style={styles.statusBannerText}>
                            {connectionStatus === 'connecting' && 'Connecting...'}
                            {connectionStatus === 'disconnected' && 'Disconnected. Reconnecting...'}
                            {connectionStatus === 'error' && 'Connection Error'}
                        </Text>
                    </View>
                )}
                <FlatList
                    data={processedMessages}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    inverted
                    contentContainerStyle={styles.messageList}
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Input messages..."
                        editable={connectionStatus === 'connected'}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, connectionStatus !== 'connected' && styles.disabledButton]}
                        onPress={onSend}
                        disabled={connectionStatus !== 'connected'}
                    >
                        <SendIcon />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    // --- Header Styles ---
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Oxanium-Bold',
    },
    // --- Message List Styles ---
    messageList: { paddingHorizontal: 10, paddingTop: 10 },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 2, // Khoảng cách nhỏ giữa các tin nhắn
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    theirMessageRow: {
        justifyContent: 'flex-start',
        alignItems: 'flex-end', // Để avatar nằm ở dưới cùng của chuỗi tin nhắn
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
        maxWidth: '75%',
    },
    myMessage: {
        backgroundColor: '#d9534f',
        alignSelf: 'flex-end',
    },
    theirMessage: {
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
    },
    messageText: { fontSize: 16, fontFamily: 'Oxanium-Regular' },
    timestampText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginVertical: 8,
        fontFamily: 'Oxanium-Regular',
    },
    // --- Input Styles ---
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontFamily: 'Oxanium-Regular',
        backgroundColor: '#f0f2f5',
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#d9534f',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    statusBanner: {
        padding: 8,
        backgroundColor: '#ffc107',
        alignItems: 'center',
    },
    statusBannerText: {
        color: '#fff',
        fontFamily: 'Oxanium-SemiBold',
    }
});
