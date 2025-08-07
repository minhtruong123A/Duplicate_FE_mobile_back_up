import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { CartStackParamList } from '../types/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Định nghĩa kiểu cho props của màn hình Cart
type Props = NativeStackScreenProps<CartStackParamList, 'Cart'>;

export default function Cart({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text>Đây là màn hình Giỏ hàng</Text>
      <Button
        title="Đi đến mục Yêu thích"
        onPress={() => navigation.navigate('Favorite')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});