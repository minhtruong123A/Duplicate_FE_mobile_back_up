import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BoxShop() {
  return (
    <View style={styles.container}>
      <Text>Box Shop Screen</Text>
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
