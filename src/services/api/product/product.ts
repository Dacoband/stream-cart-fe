import rootApi from "../../rootApi";
import { CreateProductDTO,filterProduct } from "@/types/product/product";
export const getAllProducts = async () => {
  try {
    const response = await rootApi.get("products");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
export const getProductById = async (productId:string) => {
  try {
    const response = await rootApi.get(`products/${productId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product detail:", error);
    throw error;
  }
};
export const getProductDetailById = async (productId:string) => {
  try {
    const response = await rootApi.get(`products/${productId}/detail`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product detail:", error);
    throw error;
  }
};

export const createProduct = async (data: CreateProductDTO) => {
  try {
      const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.post(
      "products/complete",
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
export const getProductHasFilter = async (data: filterProduct) => {
  try {
    const response = await rootApi.get('/products/paged', {
      params: {
        pageNumber: data.pageNumber ?? 1,
        pageSize: data.pageSize ?? 10,
        sortOption:data.sortOption??null,
        activeOnly: data.activeOnly ?? null,
        shopId: data.shopId ?? null,
        InstockOnly:data.InstockOnly??null
      },
    })
    console.log(response)
    return response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}