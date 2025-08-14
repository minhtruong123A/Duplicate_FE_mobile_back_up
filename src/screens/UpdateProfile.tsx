import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import type { RootStackParamList } from '../types/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import các hàm API
import { getProfile, getBankID, updateProfile } from '../services/api.user';
import { buildImageUrl } from '../services/api.imageproxy';


type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;


// Định nghĩa các kiểu dữ liệu (có thể chuyển vào types.ts)
type UserProfile = {
  username: string;
  email: string;
  profileImage: string;
  phoneNumber: string;
  accountBankName: string;
  banknumber: string;
  bankId: string;
};

type Bank = {
  id: number;
  name: string;
  short_name: string;
  logo: string;
};

type FormState = {
  phoneNumber: string;
  accountBankName: string;
  bankNumber: string;
  bankid: string;
};

export default function UpdateProfile() {
  const navigation = useNavigation<ProfileNavigationProp>();

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<FormState>({
    phoneNumber: "",
    accountBankName: "",
    bankNumber: "",
    bankid: "",
  });
  const [bankList, setBankList] = useState<Bank[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [useBackup, setUseBackup] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBankModalVisible, setBankModalVisible] = useState(false);

  // Lấy dữ liệu khi vào màn hình
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [profileRes, bankRes] = await Promise.all([getProfile(), getBankID()]);

          if (profileRes?.data) {
            setProfile(profileRes.data);
            setForm({
              phoneNumber: profileRes.data.phoneNumber || '',
              accountBankName: profileRes.data.accountBankName || '',
              bankNumber: profileRes.data.banknumber || '',
              bankid: profileRes.data.bankId || '',
            });
          }
          if (bankRes?.data) {
            setBankList(bankRes.data);
          }
        } catch (error) {
          Alert.alert("Error", "Failed to load profile data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  // Hàm chọn ảnh
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Hàm submit
  const handleSubmit = async () => {
    // Validation cơ bản
    if (form.bankid && (!form.accountBankName || !form.bankNumber)) {
      return Alert.alert("Error", "If a bank is selected, account name and number are required.");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Thêm ảnh nếu người dùng đã chọn ảnh mới
      if (selectedImage) {
        const uriParts = selectedImage.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('urlImage', {
          uri: selectedImage.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      // Thêm các trường dữ liệu khác
      formData.append('phoneNumber', form.phoneNumber);
      formData.append('accountBankName', form.accountBankName);
      formData.append('bankNumber', form.bankNumber);
      formData.append('bankid', form.bankid);

      await updateProfile(formData, true);

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.navigate('Profile', { reload: Date.now() }) }
      ]);

    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#d9534f" /></View>;
  }

  // const currentAvatarUri = selectedImage?.uri || (profile?.profileImage ? buildImageUrl(profile.profileImage) : undefined);
  const avatarUri = selectedImage?.uri
    ? selectedImage.uri
    : profile?.profileImage
      ? buildImageUrl(profile.profileImage, useBackup)
      : null;
  const selectedBank = bankList.find(b => String(b.id) === String(form.bankid));

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={40}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Phần Avatar */}
          <View style={styles.avatarSection}>
            <Image
              source={
                imageLoadFailed || !avatarUri
                  ? require('../../assets/logo.png')
                  : { uri: avatarUri }
              }
              style={styles.avatar}
              onError={() => {
                if (!useBackup) {
                  console.log("Ảnh trên server chính lỗi, chuyển sang backup server");
                  setUseBackup(true);
                } else {
                  console.log("Ảnh trên server backup cũng lỗi, dùng ảnh local");
                  setImageLoadFailed(true);
                }
              }}
            />
            <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
              <Text style={styles.changeAvatarText}>Change Avatar</Text>
            </TouchableOpacity>
          </View>

          {/* Phần Form */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={profile?.username} editable={false} />

            <Text style={styles.label}>Email</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={profile?.email} editable={false} />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={form.phoneNumber}
              onChangeText={(text) => setForm({ ...form, phoneNumber: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Bank</Text>
            <TouchableOpacity style={styles.input} onPress={() => setBankModalVisible(true)}>
              <Text style={styles.bankText}>{selectedBank ? selectedBank.short_name : 'Select a bank'}</Text>
            </TouchableOpacity>

            {form.bankid && (
              <>
                <Text style={styles.label}>Account Name</Text>
                <TextInput
                  style={styles.input}
                  value={form.accountBankName}
                  onChangeText={(text) => setForm({ ...form, accountBankName: text })}
                  placeholder="Enter account holder name"
                />
                <Text style={styles.label}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={form.bankNumber}
                  onChangeText={(text) => setForm({ ...form, bankNumber: text })}
                  placeholder="Enter account number"
                  keyboardType="number-pad"
                />
              </>
            )}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>

          {/* Modal Chọn Ngân Hàng */}
          <Modal
            visible={isBankModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setBankModalVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setBankModalVisible(false)}>
              <View style={styles.bankModalContainer}>
                <FlatList
                  data={bankList}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.bankItem} onPress={() => {
                      setForm({ ...form, bankid: String(item.id) });
                      setBankModalVisible(false);
                    }}>
                      <Image source={{ uri: item.logo }} style={styles.bankLogo} />
                      <Text style={styles.bankName}>{item.short_name} - {item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </Pressable>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
  changeAvatarButton: { backgroundColor: '#f0f2f5', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  changeAvatarText: { color: '#333', fontFamily: 'Oxanium-SemiBold' },
  formSection: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: 'Oxanium-SemiBold', color: '#666', marginBottom: 8 },
  input: {
    backgroundColor: '#f0f2f5',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Oxanium-Regular',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  disabledInput: { backgroundColor: '#e9ecef', color: '#6c757d' },
  bankText: { fontSize: 16, fontFamily: 'Oxanium-Regular' },
  saveButton: {
    backgroundColor: '#d9534f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Oxanium-Bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bankModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    padding: 20,
  },
  bankItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  bankLogo: { width: 40, height: 40, resizeMode: 'contain', marginRight: 15 },
  bankName: { fontSize: 16, fontFamily: 'Oxanium-Regular' },
});
