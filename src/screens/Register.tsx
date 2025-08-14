import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Modal,
    Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import hook điều hướng
import { registerApi, sendVerifyEmailApi, confirmOtpApi } from '../services/api.auth';
import { Svg, Path } from 'react-native-svg'; // Import Svg để tạo icon
import { AuthTabNavigationProp } from '../types/types';

// --- Component Icon Mắt (ẩn/hiện mật khẩu) ---
const EyeIcon = ({ onPress, isVisible }: { onPress: () => void, isVisible: boolean }) => (
    <TouchableOpacity onPress={onPress} style={styles.visibilityIcon}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            {isVisible ? (
                <>
                    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#888" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#888" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </>
            ) : (
                <>
                    <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="#888" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M1 1l22 22" stroke="#888" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </>
            )}
        </Svg>
    </TouchableOpacity>
);

// ... Các hàm validation giữ nguyên ...
const validateUsername = (userName: string) => /^[a-zA-Z0-9_]{3,15}$/.test(userName);
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password: string) => /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?\\:{}|<>]).{8,15}$/.test(password);

export default function Register() {
    // --- State cho Form ---
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State cho icon mắt
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State cho icon mắt

    // --- State cho luồng OTP ---
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');

    // --- State quản lý trạng thái ---
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation<AuthTabNavigationProp>();

    const handleRegister = async () => {
        // ... validation giữ nguyên ...
        if (!userName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            return Alert.alert("Error", "Please fill in all fields.");
        }
        if (!validateUsername(userName)) {
            return Alert.alert("Invalid Username", "Username must be 3-15 characters long...");
        }
        if (!validateEmail(email)) {
            return Alert.alert("Invalid Email", "Please enter a valid email address.");
        }
        if (!validatePassword(password)) {
            return Alert.alert("Weak Password", "Password must be 8-15 characters long...");
        }
        if (password !== confirmPassword) {
            return Alert.alert("Error", "Passwords do not match.");
        }

        setIsLoading(true);

        try {
            await registerApi({ userName, email, password });
            await sendVerifyEmailApi(email);

            Alert.alert(
                "Success",
                "Account created. Please check your email for an OTP."
            );
            setShowOtpModal(true);

        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || "Registration failed. Please try again.";
            Alert.alert("Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert("Error", "OTP must be 6 digits.");
            return;
        }

        setIsLoading(true);

        try {
            await confirmOtpApi(otp, email);
            Alert.alert(
                "Verification Successful!",
                "Your account has been activated. Please proceed to the login screen."
            );
            setShowOtpModal(false);

            // XÓA DỮ LIỆU CÁC Ô INPUT
            setUserName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setOtp('');

            // TỰ ĐỘNG CHUYỂN SANG TAB LOGIN
            navigation.navigate('Login');

        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || "Invalid OTP. Please try again.";
            Alert.alert("Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* --- Modal nhập OTP --- */}
            <Modal
                visible={showOtpModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowOtpModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowOtpModal(false)}>
                    <Pressable style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Email Verification</Text>
                        <Text style={styles.modalSubtitle}>An OTP has been sent to {email}. Please enter it below.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter OTP Code"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleOtpSubmit} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm</Text>}
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* --- Form Đăng ký --- */}
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={userName}
                onChangeText={setUserName}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {/* Ô nhập mật khẩu với icon */}
            <View style={styles.passwordInputContainer}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <EyeIcon isVisible={showPassword} onPress={() => setShowPassword(!showPassword)} />
            </View>
            {/* Ô xác nhận mật khẩu với icon */}
            <View style={styles.passwordInputContainer}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                />
                <EyeIcon isVisible={showConfirmPassword} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
                {isLoading && !showOtpModal ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Register</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f0f2f5' },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
        fontFamily: 'Oxanium-Regular',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    // Style cho container của input password và icon
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
    },
    // Style cho input password khi có icon
    inputPassword: {
        flex: 1,
        padding: 15,
        fontSize: 16,
        fontFamily: 'Oxanium-Regular',
    },
    // Icon ẩn/hiện mật khẩu

    visibilityIcon: {
        padding: 10,
    },
    button: {
        backgroundColor: '#d9534f',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Oxanium-Bold',
    },
    // ... styles cho Modal giữ nguyên
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Oxanium-Bold',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: 'Oxanium-Regular',
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
});