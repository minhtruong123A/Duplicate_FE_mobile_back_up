import { apiWithFallback } from "../config/axios";

export const createPayment = async (items) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/cs/api/PayOS/create-payment",
      data: {
        items,
      },
      requiresAuth: true,
    });

    return response.data;
  } catch (error) {
    console.error(" Error creating payment:", error);
    throw error;
  }
};

export const checkTransactionStatus = async (orderCode) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/PayOS/payment-status?orderCode=${orderCode}`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error checking transaction:", error.response?.data || error.message);
    throw error;
  }
};

export const ChangeTransactionStatus = async () => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: `/api/PayOS/check-transactions`,
    });
    return response.data;
  } catch (error) {
    console.error("Error checking transaction:", error.response?.data || error.message);
    throw error;
  }
};



