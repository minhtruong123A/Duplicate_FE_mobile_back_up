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
import { useAuth } from '../context/AuthContext';
// Thêm các API cho chức năng quên mật khẩu
import { loginApi, sendVerifyEmailApi, confirmOtpApi, sendForgotPasswordOtpApi, confirmForgotPasswordApi } from '../services/api.auth';
import { Svg, Path } from 'react-native-svg'; // Import Svg để tạo icon

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


export default function Login() {
    // --- State cho Form chính ---
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State cho icon mắt
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    // --- State cho luồng OTP (khi tài khoản chưa xác thực) ---
    const [showVerificationOtpModal, setShowVerificationOtpModal] = useState(false);
    const [emailToVerify, setEmailToVerify] = useState('');
    const [otp, setOtp] = useState('');

    // --- State cho luồng Quên mật khẩu ---
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordOtp, setForgotPasswordOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState(''); // State cho xác nhận mật khẩu
    const [showNewPassword, setShowNewPassword] = useState(false); // State cho icon mắt
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false); // State cho icon mắt


    const handleLogin = async () => {
        if (!userName || !password) {
            Alert.alert("Error", "Please enter your username and password.");
            return;
        }

        setIsLoading(true);
        try {
            const data = await loginApi(userName, password);

            if (data?.access_token && data?.is_email_verification && data?.role === "user") {
                login(data.access_token, data.refresh_token);
            }
            else if (data?.is_email_verification === false) {
                setEmailToVerify(data.email);
                await sendVerifyEmailApi(data.email);
                Alert.alert("Email Verification Required", `An OTP has been sent to ${data.email}.`);
                setShowVerificationOtpModal(true);
            }
            else if (data?.success === false) {
                Alert.alert("Login Failed", data.error || "Incorrect username or password!");
            }
            else {
                throw new Error("Invalid response from server.");
            }

        } catch (error: any) {
            // console.error("Login failed:", JSON.stringify(error, null, 2));
            const responseData = error?.response?.data;
            let errorMessage = "Login failed. Please check your credentials.";
            if (responseData?.error_code === 403) {
                errorMessage = responseData.error || 'You have been restricted.';
            } else if (responseData?.error_code === 404) {
                errorMessage = responseData.error || 'Incorrect username or password!';
            } else if (error.message === "Network Error") {
                errorMessage = "Network Error. Please check your connection.";
            }
            Alert.alert("Login Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPasswordRequest = async () => {
        if (!forgotPasswordEmail) {
            return Alert.alert("Error", "Please enter your email address.");
        }
        setIsLoading(true);
        try {
            await sendForgotPasswordOtpApi(forgotPasswordEmail);
            Alert.alert("Success", "An OTP has been sent to your email.");
            setForgotPasswordStep(2);
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.error || "Failed to send OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPasswordConfirm = async () => {
        if (!forgotPasswordOtp || !newPassword || !confirmNewPassword) {
            return Alert.alert("Error", "Please enter the OTP and your new password.");
        }
        if (newPassword !== confirmNewPassword) {
            return Alert.alert("Error", "New passwords do not match.");
        }
        setIsLoading(true);
        try {
            await confirmForgotPasswordApi({
                email: forgotPasswordEmail,
                code: forgotPasswordOtp,
                password: newPassword
            });
            Alert.alert("Success", "Your password has been reset. Please log in with your new password.");
            setShowForgotPasswordModal(false);
            setForgotPasswordEmail('');
            setForgotPasswordOtp('');
            setNewPassword('');
            setConfirmNewPassword('');
            setForgotPasswordStep(1);
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.error || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    // SỬA LỖI Ở ĐÂY: Thêm logic cho hàm
    const handleVerificationOtpSubmit = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert("Error", "OTP must be 6 digits.");
            return;
        }

        setIsLoading(true);
        try {
            await confirmOtpApi(otp, emailToVerify);
            Alert.alert("Success!", "Your account has been activated. Please log in again.");
            setShowVerificationOtpModal(false);
            setOtp('');
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.error || "Invalid OTP.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            {/* --- Modal Xác thực Email --- */}
            <Modal
                visible={showVerificationOtpModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowVerificationOtpModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowVerificationOtpModal(false)}>
                    <Pressable style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Email Verification</Text>
                        <Text style={styles.modalSubtitle}>An OTP has been sent to {emailToVerify}. Please enter it below.</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter OTP Code"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={handleVerificationOtpSubmit} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm</Text>}
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* --- Modal Quên mật khẩu --- */}
            <Modal
                visible={showForgotPasswordModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowForgotPasswordModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowForgotPasswordModal(false)}>
                    <Pressable style={styles.modalContainer}>
                        {forgotPasswordStep === 1 ? (
                            <>
                                <Text style={styles.modalTitle}>Forgot Password</Text>
                                <Text style={styles.modalSubtitle}>Enter your email address to receive an OTP.</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Your Email Address"
                                    value={forgotPasswordEmail}
                                    onChangeText={setForgotPasswordEmail}
                                    keyboardType="email-address"
                                />
                                <TouchableOpacity style={styles.modalButton} onPress={handleForgotPasswordRequest} disabled={isLoading}>
                                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.modalTitle}>Reset Password</Text>
                                <Text style={styles.modalSubtitle}>Enter the OTP sent to {forgotPasswordEmail} and your new password.</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter OTP Code"
                                    value={forgotPasswordOtp}
                                    onChangeText={setForgotPasswordOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.modalInputPassword}
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showNewPassword}
                                    />
                                    <EyeIcon isVisible={showNewPassword} onPress={() => setShowNewPassword(!showNewPassword)} />
                                </View>
                                <View style={styles.passwordInputContainer}>
                                    <TextInput
                                        style={styles.modalInputPassword}
                                        placeholder="Confirm New Password"
                                        value={confirmNewPassword}
                                        onChangeText={setConfirmNewPassword}
                                        secureTextEntry={!showConfirmNewPassword}
                                    />
                                    <EyeIcon isVisible={showConfirmNewPassword} onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)} />
                                </View>
                                <TouchableOpacity style={styles.modalButton} onPress={handleForgotPasswordConfirm} disabled={isLoading}>
                                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Reset</Text>}
                                </TouchableOpacity>
                            </>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>

            {/* --- Form Đăng nhập --- */}
            <TextInput
                style={styles.input}
                placeholder="Username or Email"
                value={userName}
                onChangeText={setUserName}
                autoCapitalize="none"
            />
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

            <TouchableOpacity onPress={() => setShowForgotPasswordModal(true)}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                {isLoading && !showVerificationOtpModal && !showForgotPasswordModal ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Login</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f2f5'
    },
    input: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 15,
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
        paddingVertical: 12,
        paddingHorizontal: 15,
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
    forgotPasswordText: {
        color: '#d9534f',
        textAlign: 'right',
        fontFamily: 'Oxanium-Regular',
        fontSize: 14,
        marginBottom: 20,
    },
    // --- Styles cho Modal ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'Oxanium-Bold',
        marginBottom: 10,
        color: '#333',
    },
    modalSubtitle: {
        fontSize: 15,
        fontFamily: 'Oxanium-Regular',
        textAlign: 'center',
        marginBottom: 25,
        color: '#666',
        lineHeight: 22,
    },
    modalInput: {
        width: '100%',
        backgroundColor: '#f0f2f5',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
        fontFamily: 'Oxanium-Regular',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    // Style cho input password trong Modal
    modalInputPassword: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        fontFamily: 'Oxanium-Regular',
    },
    modalButton: {
        backgroundColor: '#d9534f',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        width: '100%',
        marginTop: 10,
    },
});
