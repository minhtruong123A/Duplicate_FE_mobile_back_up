import { apiWithFallback } from "../config/axios";

//api using for get all of product on sale
export const getAllProductsOnSale = async () => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: "/api/SellProduct/get-all-product-on-sale",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products on sale:", error.response?.data);
    throw error.response?.data || new Error("Error fetching products on sale");
  }
}

//api using for get product on sale detail
export const getProductOnSaleDetail = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/SellProduct/get-product-on-sale/${id}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching product detail:", error.response?.data);
    throw error.response?.data || new Error("Error fetching product detail");
  }
}

// This api is for Buy product on sale
export const buyProductOnSale = async ({ sellProductId, quantity }) => {
  try {
    const response = await apiWithFallback({
      method: "post",
      url: "/api/SellProduct/buy-sell-product",
      data: { sellProductId, quantity },
      requiresAuth: true, // tự động gắn token từ interceptor
    });
    return response.data;
  } catch (error) {
    console.error("Error buying product on sale:", error.response?.data);
    throw error.response?.data || new Error("Error buying product on sale");
  }
};

//this api is using for get detail of an collection
export const getCollectionDetail = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "get",
      url: `/api/Product/get-product/${id}`,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching collection detail:", error.response?.data);
    throw error.response?.data || new Error("Error fetching collection detail");
  }
};

//this api using for changing the status of product for update
export const TurnOnOffProductOnSale = async (id) => {
  try {
    const response = await apiWithFallback({
      method: "put",
      url: `/api/SellProduct/turn-on/off-sell-product`,
      params: { sellProductId: id },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error toggling product on sale status:", error.response?.data);
    throw error.response?.data || new Error("Error toggling product on sale status");
  }
};

//This api is use for update the sell product after they have turn to isSale === false
export const updateSellProduct = async ({ id, description, price, updatedAt }) => {
  try {
    const response = await apiWithFallback({
      method: "put",
      url: "/api/SellProduct/update-sell-product",
      data: { id, description, price, updatedAt },
      requiresAuth: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating sell product:", error.response?.data);
    throw error.response?.data || new Error("Error updating sell product");
  }
};