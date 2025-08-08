// src/components/CustomHeader.tsx

import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Text,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';
import CartIcon from '../../assets/icons/cart_outline.svg';
import MmbLogo from '../../assets/icons/mmb_logo.svg';
import { RootStackNavigationProp } from '../types/types';
import SearchResults from '../screens/SearchResults'; // Import component mới
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// --- Icons ---
const SearchIcon = (props: any) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="#666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ProfileIcon = (props: any) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const SettingsIcon = (props: any) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 010 2l-.15.08a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.38a2 2 0 00-.73-2.73l-.15-.08a2 2 0 010-2l.15-.08a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const HelpIcon = (props: any) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const LogoutIcon = (props: any) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#d9534f" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 17l5-5-5-5M21 12H9" stroke="#d9534f" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const OrderIcon = (props: any) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13 2v7h7" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const ExchangeIconMenu = (props: any) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M16 3h5v5M4 20L21 3M21 16v5h-5M3 4l18 18" stroke="#333" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function CustomHeader() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const { logout } = useAuth(); // Lấy hàm logout từ context

  const handleLogout = () => {
    Alert.alert(
      "Log out", "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        // { text: "Log out", onPress: () => console.log("Logout action"), style: 'destructive' }
        { text: "Log out", onPress: logout, style: 'destructive' } // <-- Gọi hàm logout

      ]
    );
  };

  const menuItems = [
    { label: 'Profile', action: () => navigation.navigate('Profile'), icon: <ProfileIcon /> },
    { label: 'Order History', action: () => navigation.navigate('OrderHistory'), icon: <OrderIcon /> },
    { label: 'Exchange History', action: () => navigation.navigate('ExchangeRequests'), icon: <ExchangeIconMenu /> },
    { label: 'Settings', action: () => navigation.navigate('Settings'), icon: <SettingsIcon /> },
    { label: 'Help & Feedback', action: () => navigation.navigate('Help & Feedback'), icon: <HelpIcon /> },
    { label: 'Log out', action: handleLogout, icon: <LogoutIcon /> },
  ];

  return (
    <View style={styles.headerContainer}>
      <Modal
        visible={searchVisible}
        animationType="slide"
        onRequestClose={() => setSearchVisible(false)}
      >
        <SearchResults onClose={() => setSearchVisible(false)} />
      </Modal>

      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, item.label === 'Log out' && styles.logoutItem]}
                  onPress={() => { setMenuVisible(false); item.action(); }}
                >
                  {item.icon}
                  <Text style={[styles.menuItemText, item.label === 'Log out' && styles.logoutItemText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.topRow}>
        <MmbLogo width={140} height={60} />
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.searchContainer} onPress={() => setSearchVisible(true)}>
          <SearchIcon style={styles.searchIcon} />
          <Text style={styles.searchInputPlaceholder}>Find...</Text>
        </TouchableOpacity>

        <View style={styles.rightContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ShoppingCartStack', {
              screen: 'ShoppingCart',
              params: { screen: 'Favorite Boxes' }
            })}
          >
            <CartIcon width={28} height={28} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <Image
              source={{ uri: 'https://mmb-be-dotnet.onrender.com/cs/api/ImageProxy/5804dc84-a559-4ea1-b887-6db398a4b56b.jpg' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topRow: {
    alignItems: 'center',
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    height: 40,
  },
  searchIcon: { marginLeft: 12 },
  searchInputPlaceholder: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Oxanium-Regular',
    color: '#666'
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  menuContainer: {
    position: 'absolute',
    top: 90,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    width: 220,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Oxanium-SemiBold',
    marginLeft: 12,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 4,
  },
  logoutItemText: { color: '#d9534f' },
});
