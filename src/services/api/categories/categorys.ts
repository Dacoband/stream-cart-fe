
import rootApi from '../../rootApi'
import type {
  createCategory as CreateCategoryDTO,
  filterCategory,
} from '@/types/category/category'

export const getAllCategories = async (data: filterCategory) => {
  try {
    const response = await rootApi.get('categorys', {
      params: {
        PageIndex: data.PageIndex ?? 1,
        PageSize: data.PageSize ?? 10,
        CategoryName: data.CategoryName || '',
        IsDeleted: data.IsDeleted ?? null,
        ParentCategoryID: data.ParentCategoryID ?? null,
      },
    })
    console.log(response)
    return response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

export const getAllCategoriesForHome = async () => {
  try {
    const response = await rootApi.get('categorys', {
      
    })
    console.log(response)
    return response.data.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}
export const getCategoryById = async (categoryId:string) => {
  try {
    const response = await rootApi.get(`categorys/${categoryId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching category detail:", error);
    throw error;
  }
};
export const getDetailCategory = async (id: string) => {
  try {
    const response = await rootApi.get(`categorys/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetch detail category', error)
  }
}

export const createCategory = async (createDTO: CreateCategoryDTO) => {
  try {
    const token = localStorage.getItem('token')
    console.log(token)
    if (!token) {
      throw new Error('Vui lòng đăng nhập để thực hiện chứ năng này')
    }
    const response = await rootApi.post('categorys', createDTO, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (err) {
    console.error('error create category', err)
  }
}

export const updateCategory = async (
  id: string,
  updateDTO: CreateCategoryDTO
) => {
  try {
    const token = localStorage.getItem('token')
    console.log(token)
    if (!token) {
      throw new Error('Vui lòng đăng nhập để thực hiện chức năng này')
    }
    const response = await rootApi.put(`categorys/${id}`, updateDTO, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (err) {
    console.error('error update category', err)
    throw err
  }
}

export const deleteCategory = async (id: string) => {
  try {
    const token = localStorage.getItem('token')
    console.log(token)
    if (!token) {
      throw new Error('Vui lòng đăng nhập để thực hiện chức năng này')
    }
    const response = await rootApi.delete(`categorys/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (err) {
    console.error('error delete category', err)
    throw err
  }
}
