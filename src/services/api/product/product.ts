import rootApi from "../../rootApi";
import { CreateProduct } from "@/types/product/product";
export const getAllProducts = async () => {
  try {
    const response = await rootApi.get("products");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
export const createProduct = async (data: CreateProduct) => {
  try {
      const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.post(
      "products",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};
export const getBestSellingProducts = async () => {
  try {
    const response = await rootApi.get("products/bestselling?count=18");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};