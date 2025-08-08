// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Định nghĩa kiểu dữ liệu cho context
type AuthContextType = {
    userToken: string | null;
    login: (token: string) => void;
    logout: () => void;
};

// Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tạo Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(null);

    const authContextValue = {
        login: (token: string) => {
            // Sau này, bạn sẽ lưu token vào AsyncStorage ở đây
            setUserToken(token);
        },
        logout: () => {
            // Xóa token khỏi AsyncStorage
            setUserToken(null);
        },
        userToken,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Tạo hook tùy chỉnh để dễ dàng sử dụng context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
