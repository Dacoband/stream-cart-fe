import rootApi from "../../rootApi";

export const getImageProductByProductId = async (productId:string) => {
  try {
    const response = await rootApi.get(`product-images/products/${productId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching product image detail:", error);
    throw error;
  }
};

export const createProductImage = async (data: {
  productId: string;
  imageUrl: string;
  variantId?: string | null;
  isPrimary?: boolean;
  displayOrder?: number;
  altText?: string;
}) => {
  try {
    const response = await rootApi.post(`product-images`, data);
    return response.data?.data;
  } catch (error) {
    console.error("Error creating product image:", error);
    throw error;
  }
};

export const updateProductImage = async (
  id: string,
  data: {
    isPrimary?: boolean;
    displayOrder?: number;
    altText?: string;
    imageUrl?: string;
  }
) => {
  try {
    if (!id) throw new Error("Missing id");
    const response = await rootApi.put(`product-images/${id}`, data);
    return response.data?.data;
  } catch (error) {
    console.error("Error updating product image:", error);
    throw error;
  }
};

export const deleteProductImage = async (id: string) => {
  try {
    if (!id) throw new Error("Missing id");
    const response = await rootApi.delete(`product-images/${id}`);
    return response.data?.data;
  } catch (error) {
    console.error("Error deleting product image:", error);
    throw error;
  }
};