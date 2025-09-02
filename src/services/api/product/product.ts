
import rootApi from "../../rootApi";
import { CreateProductDTO,filterProduct, GetPagedProductsParams, ProductSearchParams, ProductSearchResponse  } from "@/types/product/product";

export const getAllProducts = async () => {
  try {
    const response = await rootApi.get('products')
    return response.data
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}
export const getProductById = async (productId: string) => {
  try {
    const response = await rootApi.get(`products/${productId}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching product detail:', error)
    throw error
  }
}
export const getProductDetailById = async (productId: string) => {
  try {
    const response = await rootApi.get(`products/${productId}/detail`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching product detail:', error)
    throw error
  }
}

export const createProduct = async (data: CreateProductDTO) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
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
    console.error('Error creating product:', error)
    throw error
  }
}
export const getBestSellingProducts = async () => {
  try {
    const response = await rootApi.get('products/bestselling?count=18')
    return response.data.data
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
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
export const deleteProductById = async (productId:string) => {
  try{
 
const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

  const response = await rootApi.delete(`products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data}
   catch (error) {
    console.error("Error delete product:", error);
    throw error;
  }
}

export const getProductsByShopId = async (
  shopId: string,
  activeOnly: boolean = false
) => {
  try {
    const response = await rootApi.get(`products/shop/${shopId}`, {
      params: {
        activeOnly,
      },
    })
    console.log('shopproduct', response)
    return response.data?.data || []
  } catch (error) {
    console.error('Error fetching products by shop ID:', error)
    throw new Error('Không thể tải danh sách sản phẩm của cửa hàng.')
  }
}
export const getPagedProducts = async (params: GetPagedProductsParams) => {
  try {
    const response = await rootApi.get('products/paged', {
      params,
    })
    console.log('list product', response)
    return response.data?.data.items
  } catch (error) {
    console.error('Error fetching paged products:', error)
    throw new Error('Không thể tải danh sách sản phẩm phân trang.')
  }
}

export const updateStockProductById = async (productId: string, data: { quantityChange: number }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const response = await rootApi.put(
      `products/${productId}/stock`, 
      { quantityChange: data.quantityChange },  
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
}

export const searchProducts = async (params: ProductSearchParams): Promise<ProductSearchResponse> => {
  try {
    if (!params.searchTerm || params.searchTerm.trim() === '') {
      throw new Error('searchTerm is required');
    }
    const response = await rootApi.get('products/search', {
      params: {
        SearchTerm: params.searchTerm,
        PageNumber: params.pageNumber,
        PageSize: params.pageSize,
        CategoryId: params.categoryId,
        MinPrice: params.minPrice,
        MaxPrice: params.maxPrice,
        ShopId: params.shopId,
        SortBy: params.sortBy,
        InStockOnly: params.inStockOnly,
        MinRating: params.minRating,
        OnSaleOnly: params.onSaleOnly,
      },
    });
    return response.data as ProductSearchResponse;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

