import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ChatIcon from '../../assets/icons/chat.svg';
// Chỉ cần import type này
import { RootTabNavigationProp } from '../types/types';

export default function CustomHeader() {
  // Chỉ giữ lại một dòng này, và dùng đúng type
  const navigation = useNavigation<RootTabNavigationProp>();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer} />
      <View style={styles.rightContainer}>
        <Image
          source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
          style={styles.avatar}
        />
        {/* Dòng này sẽ hết lỗi */}
        <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
          <ChatIcon width={28} height={28} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  leftContainer: {
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
});
