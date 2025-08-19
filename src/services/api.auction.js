
import { apiWithFallback } from "../config/axios";
import { pythonApiWithFallback } from "../config/axios";
export const getAllAuctionOfMod = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "https://api.mmb.io.vn/py/api/auction/mod",
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    // toast.error(error.response?.data?.error || "Error fetching products on sale");
    return null;
  }
};

export const updateStatusAuction = async (id, status) => {
  try {
    const response = await apiWithFallback({
      method: "patch",
      url: `/api/AuctionSettlement/update-status-auction-session`,
      data: { id, status },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Error Approve/Reject auction");
    return null;
  }
}

export const fetchAuctionList = async (filter = "started") => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: `/api/auction/all?filter=${filter}`,
      requiresAuth: true,
    });
    return response.data; // mảng 1 chiều
  } catch (error) {
    console.error(`Fetch auction list failed (filter=${filter}):`, error);
    throw error;
  }
};

export const fetchAuctionAllList = async (filter = "default") => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: `/api/auction/all?filter=${filter}`,
      requiresAuth: true,
    });
    return response.data; // mảng 1 chiều
  } catch (error) {
    console.error(`Fetch auction list failed (filter=${filter}):`, error);
    throw error;
  }
};

export const fetchAuctionProduct = async (auction_id) => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: `/api/auction/product?auction_id=${auction_id}`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Fetch auction product failed (auction_id=${auction_id}):`, error);
    throw error;
  }
};

export const fetchAuctionListStart = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/api/auction/waiting",
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
      url: "/api/auction/me",
      requiresAuth: true,
    });

    return response.data;
  } catch (error) {
    console.error("Fetch my auction list failed:", error);
    throw error;
  }
};


export const GetMyUserProductToAuctionList = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: "/api/auction/user-product",
      requiresAuth: true,
    });

    return response.data;
  } catch (error) {
    console.error("Get my user product to auction list failed:", error);
    throw error;
  }
};

export const newAuction = async (auctionData) => {
  const payload = {
    title: auctionData.title,
    descripition: auctionData.description,
    start_time: auctionData.start_time
  };

  console.log("📤 newAuction request body:", payload);

  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: "/api/auction/new",
      requiresAuth: true,
      data: payload
    });

    return response.data;
  } catch (error) {
    console.error("Create new auction failed:", error);
    throw error;
  }
};

export const productOfAuction = async (productData) => {
  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: "/api/auction/product",
      requiresAuth: true,
      data: {
        product_id: productData.product_id,
        auction_session_id: productData.auction_session_id,
        quantity: productData.quantity,
        starting_price: productData.starting_price
      }
    });

    return response.data;
  } catch (error) {
    console.error("Add product to auction failed:", error);
    throw error;
  }
};
//---------------------------------------------------------------------------
export const joinAuction = async (auction_id) => {
  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: `/api/auction/join?auction_id=${auction_id}`,
      requiresAuth: true,
    });

    // bảo vệ nếu response undefined hoặc không có data
    if (!response) {
      console.warn("joinAuction: no response from pythonApiWithFallback");
      return {
        success: false,
        data: null,
        length: 0,
        error: "No response from server",
        error_code: -1,
      };
    }

    // nếu response tồn tại nhưng không có .data, trả về object chuẩn
    if (response.data == null) {
      console.warn("joinAuction: response has no .data", response);
      return {
        success: false,
        data: null,
        length: 0,
        error: "Malformed response (no data)",
        error_code: -1,
      };
    }

    // bình thường trả về response.data (the API payload)
    return response.data;
  } catch (error) {
    console.error(`Join auction failed (auction_id=${auction_id}):`, error);

    // nếu server thực sự trả lỗi (axios-like)
    if (error && error.response && error.response.data) {
      return error.response.data;
    }

    // fallback: trả object lỗi thống nhất (không ném)
    return {
      success: false,
      data: null,
      length: 0,
      error: error?.message || "Network or unknown error",
      error_code: error?.response?.status ?? -1,
    };
  }
};


export const addBidAuction = async (auction_id, ammount) => {
  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: `/api/auction/bid?auction_id=${auction_id}&ammount=${ammount}`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Add bid failed (auction_id=${auction_id}, ammount=${ammount}):`, error);
    throw error;
  }
};

export const getBidAuction = async (auction_id) => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: `/api/auction/bid?auction_id=${auction_id}`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Get bid auction failed (auction_id=${auction_id}):`, error);
    throw error;
  }
};

export const confirmAuctionResult = async (auction_id) => {
  try {
    const response = await pythonApiWithFallback({
      method: "post",
      url: `/api/auction/confirmation?auction_id=${auction_id}`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    // console.error(`Confirm auction result failed (auction_id=${auction_id}):`, error);
    throw error;
  }
};

export const checkIsJoinedAuction = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: `/api/auction/is-joined-auction`,
      requiresAuth: true,
    });
    console.log("true or false let's find out" + response.data)
    return response.data;
  } catch (error) {
    console.error("Check is joined auction failed:", error);
    throw error;
  }
};

export const GetJoinedHistoryAuction = async () => {
  try {
    const response = await pythonApiWithFallback({
      method: "get",
      url: `/api/auction/joined-history`,
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Check is joined auction failed:", error);
    throw error;
  }
};