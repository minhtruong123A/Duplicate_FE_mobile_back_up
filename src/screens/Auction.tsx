// src/screens/Auction.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Svg, Path } from 'react-native-svg';
import OngoingAuctions from './OngoingAuctions';
import MyAuctions from './MyAuctions';

const TopTab = createMaterialTopTabNavigator();

const AddIcon = (props: any) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M12 5v14m-7-7h14" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function Auction() {
  return (
    <View style={{ flex: 1 }}>
      <TopTab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#d9534f',
          tabBarInactiveTintColor: 'gray',
          tabBarIndicatorStyle: { backgroundColor: '#d9534f' },
          tabBarLabelStyle: { fontFamily: 'Oxanium-Bold', textTransform: 'none' },
        }}
      >
        <TopTab.Screen name="Auctions" component={OngoingAuctions} />
        <TopTab.Screen name="My Auction" component={MyAuctions} />
      </TopTab.Navigator>
      {/* <TouchableOpacity style={styles.fab}>
        <AddIcon />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#d9534f',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
