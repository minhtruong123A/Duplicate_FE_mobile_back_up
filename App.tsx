import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
// import icons
import AuctionIcon from './assets/icons/auction.svg';
import AuctionIconOutline from './assets/icons/auction_outline.svg';
import CartIcon from './assets/icons/cart.svg';
import CartIconOutline from './assets/icons/cart_outline.svg';
import ChatIconOutline from './assets/icons/chat-outline.svg';
import ChatIcon from './assets/icons/chat.svg';
import NotificationIcon from './assets/icons/notification.svg';
import NotificationIconOutline from './assets/icons/notification_outline.svg';
import SettingIcon from './assets/icons/setting.svg';
import SettingIconOutline from './assets/icons/setting_outline.svg';
import ShopIconOutline from './assets/icons/shop-outline.svg';
import ShopIcon from './assets/icons/shop.svg';

// import components
import CustomHeader from './src/components/CustomHeader';

// import screen
import Auction from './src/screens/Auction';
import BoxDetail from './src/screens/BoxDetail';
import BoxShop from './src/screens/BoxShop';
import Chat from './src/screens/Chat';
import Favorite from './src/screens/Favorite';
import ProductDetail from './src/screens/ProductDetail';
import ProductShop from './src/screens/ProductShop';
import Settings from './src/screens/Settings';
import Shop from './src/screens/Shop';
import Cart from './src/screens/Cart'
import Profile from './src/screens/Profile';
import UpdateProfile from './src/screens/UpdateProfile';
import Notification from './src/screens/Notification';

//import header
import * as SplashScreen from 'expo-splash-screen';

//import file types.ts
import { RootTabParamList, ShopStackParamList, CartStackParamList, SettingsStackParamList, RootStackParamList } from './src/types/types';

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<ShopStackParamList>();
const CartNavStack = createNativeStackNavigator<CartStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const SettingsNavStack = createNativeStackNavigator<SettingsStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
// Stack Navigator for Shop (holds top Tabs) > BoxShop/ProductShop > Detail page 
// function BoxShopStack() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen name="Mystery Box" component={BoxShop}
//         options={{ headerShown: false }} />
//       <Stack.Screen name="Box Detail" component={BoxDetail}
//         options={{ headerShown: true }} />
//     </Stack.Navigator>
//   );
// }

function ShopStack() {
  return (
    <Stack.Navigator
      // Thêm thiết lập header cho toàn bộ Stack ở đây
      screenOptions={{
        header: () => <CustomHeader />, // <-- SỬ DỤNG HEADER TÙY CHỈNH
        headerShown: true, // <-- BẬT LẠI HEADER
      }}
    >
      <Stack.Screen
        name="Shop"
        component={Shop}
      // options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Mystery Box"
        component={BoxShop}
      // options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Box Detail"
        component={BoxDetail}
      // options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Collection Store"
        component={ProductShop}
      // options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Collection Detail"
        component={ProductDetail}
      // options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}

// function ProductShopStack() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen name="Collection Store" component={ProductShop}
//         options={{ headerShown: false }} />
//       <Stack.Screen name="Collection Detail" component={ProductDetail}
//         options={{ headerShown: true }} />
//     </Stack.Navigator>
//   );
// }

function CartStack() {
  return (
    // Sử dụng Stack Navigator dành riêng cho Cart
    <CartNavStack.Navigator
      screenOptions={{
        header: () => <CustomHeader />,
        headerShown: true,
      }}
    >
      <CartNavStack.Screen
        name="Cart"
        component={Cart}
      />
      <CartNavStack.Screen
        name="Favorite"
        component={Favorite}
        options={{ title: 'Favorites' }} // title này sẽ không hiển thị vì bạn dùng header tùy chỉnh
      />
    </CartNavStack.Navigator>
  );
}

function SettingsStack() {
  return (
    <SettingsNavStack.Navigator>
      <SettingsNavStack.Screen name="Settings" component={Settings} />
      <SettingsNavStack.Screen name="Profile" component={Profile} />
      <SettingsNavStack.Screen name="UpdateProfile" component={UpdateProfile} options={{ title: 'Cập nhật' }} />
    </SettingsNavStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 90,
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#ccc',
          paddingTop: 5,
          paddingBottom: 30,
        },
        tabBarIcon: ({ focused }) => {
          switch (route.name) {
            case 'Shop':
              return focused ? <ShopIcon width={24} height={24} /> : <ShopIconOutline width={24} height={24} />;
            case 'Auction':
              return focused ? <AuctionIcon width={24} height={24} /> : <AuctionIconOutline width={24} height={24} />;
            case 'Cart':
              return focused ? <CartIcon width={24} height={24} /> : <CartIconOutline width={24} height={24} />;
            case 'Notification':
              return focused ? <NotificationIcon width={24} height={24} /> : <NotificationIconOutline width={24} height={24} />;
            case 'Settings':
              return focused ? <SettingIcon width={24} height={24} /> : <SettingIconOutline width={24} height={24} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Shop" component={ShopStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Auction" component={Auction} options={{ title: 'Auction' }} />
      <Tab.Screen name="Cart" component={CartStack} options={{ title: 'Cart' }} />
      <Tab.Screen name="Settings" component={SettingsStack} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
//

export default function App() {

  const [fontsLoaded, error] = useFonts({
    'OleoScript-Bold': require('./assets/fonts/Oleo_Script/OleoScript-Bold.ttf'),
    'OleoScript-Regular': require('./assets/fonts/Oleo_Script/OleoScript-Regular.ttf'),
    'Oxanium-Bold': require('./assets/fonts/Oxanium/Oxanium-Bold.ttf'),
    'Oxanium-SemiBold': require('./assets/fonts/Oxanium/Oxanium-SemiBold.ttf'),
    'Oxanium-Medium': require('./assets/fonts/Oxanium/Oxanium-Medium.ttf'),
    'Oxanium-Regular': require('./assets/fonts/Oxanium/Oxanium-Regular.ttf'),
    'Oxanium-Light': require('./assets/fonts/Oxanium/Oxanium-Light.ttf'),
    'Oxanium-ExtraLight': require('./assets/fonts/Oxanium/Oxanium-ExtraLight.ttf'),
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('transparent');
      NavigationBar.setButtonStyleAsync('light'); // hoặc 'dark'
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error])

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <StatusBar style="auto" backgroundColor="transparent" translucent={true} />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen name="Chat" component={Chat} />
      </RootStack.Navigator>
    </NavigationContainer >
  );
}
