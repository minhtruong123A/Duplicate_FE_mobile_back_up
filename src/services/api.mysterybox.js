import { apiWithFallback } from '../config/axios';

//this api using to get all of the mysterybox that have in the system for collector
export const getAllMysteryBoxes = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/MangaBox/get-all-mystery-box",
    });
    return response.data;
  } catch (error) {
    console.error("Error when list mystery box:", error.response?.data);
    // Ném lỗi ra ngoài
    throw error.response?.data || new Error("Error when list mystery box");
  }
};
//this api using for getting the detial of the mysterybox 
export const getMysteryBoxDetail = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/MangaBox/get-mystery-box-detail/${id}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error when get mystery box detail:", error.response?.data);
    // Ném lỗi ra ngoài
    throw error.response?.data || new Error("Error when get mystery box detail");
  }
};

// Buy mystery box API call
export const buyMysteryBox = async ({ mangaBoxId, quantity }) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/MangaBox/buy-mystery-box",
      data: { mangaBoxId, quantity },
      requiresAuth: true, // ← gắn token tự động
    });

    return response.data;
  } catch (error) {
    console.error("Error when buy mystery box:", error.response?.data);
    // Ném lỗi ra ngoài
    throw error.response?.data || new Error("Error when buy mystery box");
  }
};
