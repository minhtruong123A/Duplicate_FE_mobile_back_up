import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types/types';

// Định nghĩa type cho props của màn hình này
type Props = NativeStackScreenProps<SettingsStackParamList, 'Profile'>;

export default function Profile({ navigation }: Props) {
  // Dữ liệu mẫu
  const user = {
    username: 'minhtruong123a',
    phone: '090xxxxxxx',
    avatar: 'https://i.pravatar.cc/150?img=10',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{user.username}</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mật khẩu:</Text>
            <Text style={styles.infoValue}>********</Text>
          </View>
        </View>

        <Button
          title="Chỉnh sửa thông tin"
          onPress={() => navigation.navigate('UpdateProfile')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
});