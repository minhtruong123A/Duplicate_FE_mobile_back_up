import { apiWithFallback } from '../config/axios';

export const getFeedbackOfSellProduct = async (sellProductID) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/cs/api/Feedback/Get-feedback-of-sell-product`,
      params: { sellProductID },
      requiresAuth: true,
    });

    return response.data;
  } catch (error) {
    console.error("Error when get feedback of sell product:", error);
    throw error;
  }
};
export const createFeedback = async ({ Exchange_infoId, Content, Rating }) => {
  try {
    console.log("[createFeedback] Send feedback with data:", {
      Exchange_infoId,
      Content,
      Rating
    });

    const formData = new FormData();
    formData.append("Exchange_infoId", Exchange_infoId);
    formData.append("Content", Content);
    formData.append("Rating", Rating);

    console.log("[createFeedback] FormData create:",
      [...formData.entries()] // hiển thị các cặp key-value trong formData
    );

    const response = await apiWithFallback({
      method: "post",
      url: "/cs/api/Feedback/Create-feedback",
      data: formData,
      // headers: {
      //   "Content-Type": "multipart/form-data",
      // },
      requiresAuth: true, // interceptor sẽ tự gắn token
    });

    console.log("[createFeedback] API returrn:", response);

    return response.data;
  } catch (error) {
    console.error("[createFeedback] Error when create feedback:", error);

    // hiện thông báo lỗi từ backend nếu có
    throw error.response?.data || new Error("Error when create feedback");

    // throw error;
  }
};