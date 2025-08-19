import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../navigation/RootNavigation';
import { CS_API, BACKUP_CS_API, PY_API, BACKUP_PY_API } from '@env';

// Lấy API URL từ biến môi trường
// const CS_API = "https://api.mmb.io.vn/cs";
// const BACKUP_CS_API = "https://mmb-be-dotnet.onrender.com";
// const PY_API = "https://api.mmb.io.vn/py";
// const BACKUP_PY_API = "https://sep490-manga-mystery-box-pybe.onrender.com";
// Tạo instance Axios cho từng API

const primaryAxios = axios.create({
  baseURL: CS_API,
  timeout: 10000,
});

const backupAxios = axios.create({
  baseURL: BACKUP_CS_API,
  // timeout: 10000,
});

const pythonAxios = axios.create({
  baseURL: PY_API,
  timeout: 10000,
});

const backupPythonAxios = axios.create({
  baseURL: BACKUP_PY_API,
  // timeout: 10000,
});

export const IMAGE_BASE_URL = `${CS_API}/api/ImageProxy`;
export const BACKUP_IMAGE_BASE_URL = `${BACKUP_CS_API}/api/ImageProxy`;

attachInterceptorsTo(primaryAxios);
attachInterceptorsTo(backupAxios);
attachInterceptorsTo(pythonAxios);
attachInterceptorsTo(backupPythonAxios);

function attachInterceptorsTo(instance) {

  instance.interceptors.request.use(
    async (config) => {
      // Nếu config.requiresAuth === true thì tự động gắn token
      if (config.requiresAuth) {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn(`[Auth] Token missing — skipping Authorization header for: ${config.url}`);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => {
      if (response.status === 201) {
        console.log("Tạo mới thành công:", response.data);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Nếu chính request refresh token bị lỗi thì throw luôn để vào catch
      if (originalRequest.url.includes('/api/user/auth/refresh')) {
        throw new Error("Refresh token request failed");
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = await AsyncStorage.getItem("refreshToken");
          // const res = await pythonAxios.post(`/api/user/auth/refresh?token=${refreshToken}`);

          const res = await pythonApiWithFallback({
            method: "post",
            url: `/api/user/auth/refresh?token=${refreshToken}`,
          });

          const newAccessToken = res.data.access_token;
          const newRefreshToken = res.data.refresh_token;

          await AsyncStorage.setItem("userToken", newAccessToken);
          if (res.data.refresh_token) {
            await AsyncStorage.setItem("refreshToken", newRefreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("refreshToken");
          // window.location.href = "/login";
          console.error("Session expired. Please log in again.");
          navigate('Auth');
          return Promise.reject(refreshError);
        }
      }

      if (error.response?.status === 403) {
        console.warn("Không có quyền truy cập vào tài nguyên này.");
      }

      return Promise.reject(error);
    }
  );
}


// Fallback API cho C# backend
const apiWithFallback = async (config) => {
  try {
    return await primaryAxios(config);
  } catch (err) {
    console.warn("[Fallback] C# API failed. Retrying with backup...");
    return await backupAxios(config);
    //backupAxios, primaryAxios
  }
};

// Fallback API cho Python backend
const pythonApiWithFallback = async (config) => {
  try {
    return await pythonAxios(config);
  } catch (err) {
    console.warn("[Fallback] Python API failed. Retrying with backup...");
    return await backupPythonAxios(config);
  }
};
export const PYTHON_API_BASE_URL = 'https://api.mmb.io.vn/py';
export const BACKUP_PYTHON_API_BASE_URL = 'https://sep490-manga-mystery-box-pybe.onrender.com';
// export const api = PYTHON_API_BASE_URL;
// Export các instance để dùng trực tiếp nếu cần BACKUP_PYTHON_API_BASE_URL PYTHON_API_BASE_URL
export default primaryAxios; // Dùng mặc định là C#
export {
  pythonAxios,
  backupAxios,
  backupPythonAxios,
  apiWithFallback,
  pythonApiWithFallback
};