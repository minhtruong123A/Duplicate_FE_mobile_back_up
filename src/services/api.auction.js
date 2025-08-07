import { pythonApiWithFallback } from "../config/axios";

export const fetchAuctionList = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/api/auction/all",
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("Fetch auction list failed:", error);
    throw error;
  }
};

export const fetchMyAuctionList = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/api/auction/all",
      requiresAuth: true, 
    });

    return response.data;
  } catch (error) {
    console.error("Fetch auction list failed:", error);
    throw error;
  }
};


