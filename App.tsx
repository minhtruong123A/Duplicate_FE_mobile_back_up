// App.tsx

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Auth Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Navigators
import MainTabs from './src/navigation/MainNavigator';
import { navigationRef } from './src/navigation/RootNavigation';

// Screens
import Auth from './src/screens/Auth';
import TopUpPackages from './src/screens/TopUpPackages';
import ShoppingCart from './src/screens/ShoppingCart';
import Chatbox from './src/screens/Chatbox';
import Profile from './src/screens/Profile';
import Settings from './src/screens/Settings';
import UpdateProfile from './src/screens/UpdateProfile';
import SellerProfile from './src/screens/SellerProfile';
import AuctionDetail from './src/screens/AuctionDetail';
import OrderHistory from './src/screens/OrderHistory';
import ExchangeRequests from './src/screens/ExchangeRequests';
import WithdrawRequest from './src/screens/WithdrawRequest';
import HelpScreen from './src/screens/HelpScreen'
// import { ChatProvider } from './src/context/ChatContext';

// Types
import { RootStackParamList, ShoppingCartStackParamList } from './src/types/types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const ShoppingCartStackNav = createNativeStackNavigator<ShoppingCartStackParamList>();

// --- Navigator con cho Giỏ hàng ---
function ShoppingCartStack() {
  return (
    <ShoppingCartStackNav.Navigator screenOptions={{ title: 'Your Cart' }}>
      <ShoppingCartStackNav.Screen name="ShoppingCart" component={ShoppingCart} />
    </ShoppingCartStackNav.Navigator>
  )
}

// const HelpScreen = () => <View style={styles.container}><Text>Help & Feedback</Text></View>;

// --- Navigator chính của App ---
function AppNavigator() {
  const { userToken } = useAuth();

  return (
    <RootStack.Navigator>
      {userToken == null ? (
        // --- LUỒNG CHƯA ĐĂNG NHẬP ---
        <RootStack.Screen
          name="Auth"
          component={Auth}
          options={{ headerShown: false }}
        />
      ) : (
        // --- LUỒNG ĐÃ ĐĂNG NHẬP ---
        <>
          <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <RootStack.Screen name="OrderHistory" component={OrderHistory} options={{ title: 'Order History' }} />
          <RootStack.Screen name="ExchangeRequests" component={ExchangeRequests} options={{ title: 'Exchange History' }} />
          <RootStack.Screen name="AuctionDetail" component={AuctionDetail} options={{ title: 'Auction Room' }} />
          <RootStack.Screen name="WithdrawRequest" component={WithdrawRequest} options={{ presentation: 'modal', title: 'Yêu cầu rút tiền' }} />
          <RootStack.Screen name="Chatbox" component={Chatbox} options={({ route }) => ({ title: route.params.userName })} />
          <RootStack.Screen name="SellerProfile" component={SellerProfile} options={{ title: 'Seller Profile' }} />
          <RootStack.Screen name="ShoppingCartStack" component={ShoppingCartStack} options={{ presentation: 'modal', headerShown: false }} />
          <RootStack.Screen name="TopUpPackages" component={TopUpPackages} options={{ presentation: 'modal', title: 'Select Top-up Package' }} />
          <RootStack.Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
          <RootStack.Screen name="Settings" component={Settings} />
          <RootStack.Screen name="UpdateProfile" component={UpdateProfile} options={{ title: 'Update Profile' }} />
          <RootStack.Screen name="Help & Feedback" component={HelpScreen} options={{ title: 'Policies' }} />
        </>
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Oxanium-Bold': require('./assets/fonts/Oxanium/Oxanium-Bold.ttf'),
    'Oxanium-SemiBold': require('./assets/fonts/Oxanium/Oxanium-SemiBold.ttf'),
    'Oxanium-Regular': require('./assets/fonts/Oxanium/Oxanium-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try { await SplashScreen.preventAutoHideAsync(); } catch (e) { console.warn(e); }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) { SplashScreen.hideAsync(); }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      {/* <ChatProvider> */}
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
      {/* </ChatProvider> */}
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
