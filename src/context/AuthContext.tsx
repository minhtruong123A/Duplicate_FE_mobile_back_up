import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { UserProfile } from '../types/types';
import { getProfile } from '../services/api.user';

// Định nghĩa kiểu dữ liệu cho context
type AuthContextType = {
    userToken: string | null;
    user: UserProfile | null;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // CẬP NHẬT: Di chuyển hàm login và logout ra ngoài để khắc phục lỗi scope
    const login = async (accessToken: string, refreshToken: string) => {
        try {
            setIsLoading(true);
            await AsyncStorage.setItem('userToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            setUserToken(accessToken);

            const response = await getProfile();
            if (response.status && response.data) {
                setUser(response.data);
            } else {
                throw new Error("Could not fetch user profile after login.");
            }
        } catch (error) {
            // Nếu có lỗi, đảm bảo đăng xuất sạch sẽ
            await logout(); // Gọi hàm logout đã được định nghĩa ở dưới
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refreshToken');
        setUserToken(null);
        setUser(null);
    };

    useEffect(() => {
        const bootstrapAsync = async () => {
            let token: string | null = null;
            try {
                token = await AsyncStorage.getItem('userToken');
                if (token) {
                    setUserToken(token);
                    const response = await getProfile();
                    if (response.status && response.data) {
                        setUser(response.data);
                    } else {
                        // Token còn nhưng không hợp lệ -> đăng xuất
                        await logout();
                    }
                }
            } catch (e) {
                console.error("Failed to bootstrap app state", e);
                await logout();
            }
            setIsLoading(false);
        };

        bootstrapAsync();
    }, []);

    // Dùng useMemo để đảm bảo object value không bị tạo lại mỗi lần render
    const authContextValue = useMemo(() => ({
        userToken,
        user,
        isLoading,
        isAuthenticated: !!user && !!userToken,
        login, // Tham chiếu đến hàm login đã định nghĩa ở trên
        logout, // Tham chiếu đến hàm logout đã định nghĩa ở trên
    }), [userToken, user, isLoading]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};