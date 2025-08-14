import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Button, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';

// --- BƯỚC 1: IMPORT CÁC HÀM CẦN THIẾT ---
import { getProfile, getBankID } from '../services/api.user';
import { buildImageUrl } from '../services/api.imageproxy';
import { useFocusEffect } from '@react-navigation/native';


// Định nghĩa kiểu dữ liệu cho profile (bạn có thể chuyển vào file types.ts)
type UserProfile = {
  username: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  accountBankName: string;
  banknumber: string;
  bankId: string;
};

type Bank = {
  id: number;
  name: string;
  short_name: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function Profile({ navigation }: Props) {
  // --- BƯỚC 2: TẠO STATE ĐỂ LƯU DỮ LIỆU TỪ API ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bankName, setBankName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useBackup, setUseBackup] = useState(false);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  // --- BƯỚC 3: GỌI API KHI MÀN HÌNH ĐƯỢC FOCUS ---
  // useFocusEffect sẽ chạy mỗi khi bạn quay lại màn hình này,
  // đảm bảo dữ liệu luôn được cập nhật.
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);

          // Gọi đồng thời cả hai API để tăng tốc độ
          const [profileResponse, bankResponse] = await Promise.all([
            getProfile(),
            getBankID()
          ]);

          const profileData = profileResponse?.data;
          const bankListData = bankResponse?.data;

          if (profileData) {
            setProfile(profileData);

            // Tìm tên ngân hàng từ danh sách
            if (bankListData && profileData.bankId) {
              const bank = bankListData.find((b: Bank) => String(b.id) === String(profileData.bankId));
              if (bank) {
                setBankName(bank.name);
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch profile data:", error);
          Alert.alert("Error", "Could not load profile information.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  // --- BƯỚC 4: HIỂN THỊ TRẠNG THÁI LOADING ---
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#d9534f" />
        </View>
      </SafeAreaView>
    );
  }

  // --- BƯỚC 5: HIỂN THỊ KHI KHÔNG CÓ DỮ LIỆU ---
  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <Text style={styles.infoValue}>Could not load profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Xây dựng URL ảnh đại diện
  const avatarUrl = buildImageUrl(profile.profileImage, useBackup);

  // --- BƯỚC 6: HIỂN THỊ DỮ LIỆU ĐỘNG ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={
            imageLoadFailed || !avatarUrl
              ? require('../../assets/logo.png')
              : { uri: avatarUrl }
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
        <Text style={styles.username}>{profile.username}</Text>
        <Text style={styles.email}>{profile.email}</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number:</Text>
            <Text style={styles.infoValue}>{profile.phoneNumber || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bank:</Text>
            <Text style={styles.infoValue}>{bankName || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Name:</Text>
            <Text style={styles.infoValue}>{profile.accountBankName || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Number:</Text>
            <Text style={styles.infoValue}>{profile.banknumber || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Password:</Text>
            <Text style={styles.infoValue}>********</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('UpdateProfile')}
        >
          <Text style={styles.editButtonText}>Edit Information</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#fff',
  },
  username: {
    fontSize: 24,
    fontFamily: 'Oxanium-Bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    fontFamily: 'Oxanium-Regular',
    color: '#666',
    marginBottom: 30,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'Oxanium-SemiBold',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Oxanium-Regular',
    color: '#666',
    flexShrink: 1, // Cho phép text xuống dòng nếu quá dài
    textAlign: 'right',
  },
  editButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Oxanium-Bold',
  },
});
