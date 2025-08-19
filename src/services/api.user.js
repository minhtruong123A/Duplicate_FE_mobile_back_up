import axios from 'axios';
import { apiWithFallback } from '../config/axios';

const VIET_QR_API = "https://api.vietqr.io/v2/banks";

//this api is using for get your own profile
export const getProfile = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/User/get-profile",
      requiresAuth: true, // interceptor sẽ tự gắn Bearer token
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

//this api is using for getting other profile
export const getOtherProfile = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/User/get-other-profile`,
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching other profile:", error);
    throw error;
  }
};

//this api is using for getting product that user are currently selling
export const getAllProductOnSaleOfUser = async (userId) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/SellProduct/get-all-product-on-sale-of-user/${userId}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user's products on sale:", error);
    throw error;
  }
};

//this api is using for get all collection of your profile
export const getAllCollectionOfProfile = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/UserCollection/get-all-collection-of-profile",
      requiresAuth: true, // để interceptor tự gắn Bearer token
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profile collections:", error);
    throw error;
  }
};

//this api is using for get all product in the collection of your profile
export const getAllProductOfUserCollection = async (collectionId) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/UserProduct/get-all-product-of-user-collection",
      params: { collectionId },
      requiresAuth: true, // gắn token qua interceptor
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for collection ${collectionId}:`, error);
    throw error;
  }
};

//this api is using for get all box of an user they are owned
export const getAllBoxOfProfile = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/UserBox/get-all-box-of-profile",
      requiresAuth: true, // Gắn token tự động qua interceptor
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching owner boxes:", error);
    throw error;
  }
};
//this api is using for user can randomly open the mysterybox then recived the product in an randomly way
export const openUserBox = async (userBoxId) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: `/api/UserBox/open-box/${userBoxId}`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error opening box:", error);
    throw error;
  }
};

// this api is Create sell product for collector
export const createSellProduct = async ({ userProductId, quantity, description, price }) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/SellProduct/create-sell-product",
      data: {
        UserProductId: userProductId,
        quantity,
        description,
        price,
      },
      requiresAuth: true, // Tự động gắn token
    });
    return response.data;
  } catch (error) {
    console.error("Error creating sell product:", error);
    throw error;
  }
};

// this api is using for report seller and product
export const createReport = async ({ sellProductId, sellerId, title, content }) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/Report/create-report",
      data: {
        sellProductId,
        sellerId,
        title,
        content,
      },
      requiresAuth: true, // Tự động gắn Bearer token
    });
    return response.data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

//this api is using for change password of an user
export const changePassword = async ({ userId, curentPassword, newPassword, confirmPassword }) => {
  try {
    const response = await apiWithFallback({
      method: "put",
      url: "/api/User/profile/change-password",
      data: {
        userId,
        curentPassword,
        newPassword,
        confirmPassword
      },
      requiresAuth: true, // Để interceptor tự động gắn token
    });
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

//this api is using for updating user profile
export const updateProfile = async (data, isFormData = false) => {
  try {
    let body = data;
    let headers = {};

    if (!isFormData) {
      body = {
        urlImage: data.urlImage,
        phoneNumber: data.phoneNumber,
        accountBankName: data.accountBankName,
        bankNumber: data.bankNumber,
        bankid: data.bankid
      };
    } else {
      headers["Content-Type"] = "multipart/form-data";

      console.log("[updateProfile] FormData Entries:");
      for (let pair of body.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }

    const response = await apiWithFallback({
      method: "post",
      url: "/api/User/profile/update-profile",
      data: body,
      headers,
      requiresAuth: true,
    });

    return response.data;
  } catch (error) {
    console.error('[updateProfile] Error:', error);
    if (error.response) {
      console.error('[updateProfile] Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    }
    throw error;
  }
};

//this api is using for get bank id
export const getBankID = async () => {
  try {
    const response = await axios.get(VIET_QR_API);
    return response.data;
  } catch (error) {
    console.error("Error fetching bank list:", error);
    throw error;
  }
};

//Withdraw money
export const createWithdrawTransaction = async (amount) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/cs/api/TransactionHistory/create-withdraw-transaction-request",
      params: { amount },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating withdraw transaction:", error);
    return null;
  }
};