import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { UserProfile } from '../types/types';
import { getProfile } from '../services/api.user'; // Giả định API lấy profile của chính mình
import { checkIsJoinedAuction } from '../services/api.auction';

// Định nghĩa kiểu dữ liệu cho context
type AuthContextType = {
    userToken: string | null;
    user: UserProfile | null;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAuctionJoined: boolean;
    setIsAuctionJoinedManually: (status: boolean) => void; // Thêm hàm này
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuctionJoined, setIsAuctionJoined] = useState(false);
    console.log(`[AuthContext] Trạng thái đấu giá toàn cục hiện tại: ${isAuctionJoined}`);
    const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

    const stopGlobalPolling = useCallback(() => {
        if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
        }
        setIsAuctionJoined(false);
    }, []);

    const startGlobalPolling = useCallback(() => {
        if (pollingTimerRef.current) return;
        setIsAuctionJoined(true);
        const intervalId = setInterval(async () => {
            try {
                console.log("✅ [Polling] Đang kiểm tra trạng thái tham gia đấu giá...");

                const auctionStatusRes = await checkIsJoinedAuction();
                console.log(" stopping.");
                if (auctionStatusRes.success && auctionStatusRes.data?.[0] === false) {
                    console.log("✅ [Polling] Người dùng không còn trong phiên đấu giá. Đã dừng kiểm tra.");
                    stopGlobalPolling();
                    if (user) await AsyncStorage.removeItem(`pendingAuction_${user.id}`);
                }
            } catch (e) {
                console.error("Global polling failed, stopping.", e);
                stopGlobalPolling();
            }
        }, 60000);
        pollingTimerRef.current = intervalId;
    }, [user, stopGlobalPolling]);

    const setIsAuctionJoinedManually = useCallback((status: boolean) => {
        setIsAuctionJoined(status);
    }, []);

    const logout = useCallback(async () => {
        stopGlobalPolling();
        if (user) await AsyncStorage.removeItem(`pendingAuction_${user.id}`);
        await AsyncStorage.multiRemove(['userToken', 'refreshToken']);
        setUserToken(null);
        setUser(null);
    }, [user, stopGlobalPolling]);

    const login = async (accessToken: string, refreshToken: string) => {
        try {
            setIsLoading(true);
            await AsyncStorage.setItem('userToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            setUserToken(accessToken);

            const response = await getProfile();
            if (response?.status && response.data) { // Thêm kiểm tra response tồn tại
                const currentUser = response.data;
                setUser(currentUser);
                const auctionStatusRes = await checkIsJoinedAuction();
                if (auctionStatusRes.success && auctionStatusRes.data?.[0] === true) {
                    startGlobalPolling();
                }
            } else {
                throw new Error("Could not fetch user profile after login.");
            }
        } catch (error) {
            await logout();
        } finally {
            setIsLoading(false);
        }
    };

    // --- KHỞI ĐỘNG APP ---
    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    setUserToken(token);
                    const response = await getProfile(); // Hàm này giờ đã an toàn hơn
                    console.log("profile go brr brr" + response)
                    if (response?.status && response.data) { // Thêm kiểm tra response tồn tại
                        const currentUser = response.data;
                        setUser(currentUser);
                        const pendingAuctionKey = `pendingAuction_${currentUser.id}`;
                        const storedAuctionId = await AsyncStorage.getItem(pendingAuctionKey);
                        if (storedAuctionId) {
                            startGlobalPolling();
                        }
                    } else {
                        // Nếu getProfile trả về null (do lỗi), đăng xuất
                        await logout();
                    }
                }
            } catch (e) {
                console.error("Bootstrap error", e);
                await logout();
            }
            setIsLoading(false);
        };
        bootstrapAsync();
        // SỬA LỖI: Dùng mảng rỗng để đảm bảo useEffect chỉ chạy MỘT LẦN
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const authContextValue = useMemo(() => ({
        userToken,
        user,
        isLoading,
        isAuthenticated: !!user && !!userToken,
        login,
        logout,
        isAuctionJoined,
        setIsAuctionJoinedManually, // Thêm hàm này vào value
    }), [userToken, user, isLoading, isAuctionJoined, login, logout, setIsAuctionJoinedManually]);

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
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
