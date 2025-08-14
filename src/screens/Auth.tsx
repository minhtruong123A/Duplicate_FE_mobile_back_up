// src/screens/Auth.tsx

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Login from './Login';
import Register from './Register';
import MmbLogo from '../../assets/icons/mmb_logo.svg';

const TopTab = createMaterialTopTabNavigator();

export default function Auth() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.logoContainer}>
                <MmbLogo width={180} height={80} />
            </View>
            <TopTab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#d9534f',
                    tabBarInactiveTintColor: 'gray',
                    tabBarIndicatorStyle: { backgroundColor: '#d9534f' },
                    tabBarLabelStyle: { fontFamily: 'Oxanium-Bold', fontSize: 16 },
                }}
            >
                <TopTab.Screen name="Login" component={Login} options={{ title: "Login" }} />
                <TopTab.Screen name="Register" component={Register} options={{ title: "Register" }} />
            </TopTab.Navigator>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
});
