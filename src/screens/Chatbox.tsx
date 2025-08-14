// src/screens/Chatbox.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { RootStackScreenProps } from '../types/types';

// Dữ liệu tin nhắn mẫu
const initialMessages = [
    { id: '1', text: 'Chào bạn, sản phẩm này còn không?', user: { id: '2' } },
    { id: '2', text: 'Chào bạn, vẫn còn nhé!', user: { id: '1' } },
];

const SendIcon = (props: any) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function Chatbox({ route }: RootStackScreenProps<'Chatbox'>) {
    const { userName } = route.params;
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const onSend = () => {
        if (input.trim().length > 0) {
            const newMessage = {
                id: Math.random().toString(),
                text: input,
                user: { id: '1' }, // Giả sử '1' là ID của người dùng hiện tại
            };
            setMessages(previousMessages => [newMessage, ...previousMessages]);
            setInput('');
        }
    };



    const renderItem = ({ item }: { item: typeof initialMessages[0] }) => {
        const isMyMessage = item.user.id === '1';
        return (
            <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={50}
            >

                <FlatList
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    inverted
                    contentContainerStyle={styles.messageList}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Input messages..."
                    />

                    <TouchableOpacity style={styles.sendButton} onPress={onSend}>
                        <SendIcon />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    messageList: { paddingHorizontal: 10, paddingTop: 10 },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
        marginBottom: 8,
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
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginBottom: 30,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
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
});