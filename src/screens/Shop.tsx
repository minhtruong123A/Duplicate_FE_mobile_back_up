// src/screens/Shop.tsx

import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
// Import type từ file types.ts tập trung
import { ShopScreenProps } from '../types/types';

// Áp dụng type đã import
export default function Shop({ navigation }: ShopScreenProps) {
  return (
    <View style={styles.container}>
      <Button
        title="Go to Mystery Box Shop"
        onPress={() => navigation.navigate('Mystery Box')}
      />
      <View style={styles.separator} />
      <Button
        title="Go to Collection Store"
        onPress={() => navigation.navigate('Collection Store')}
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
  separator: {
    marginVertical: 10,
  },
});