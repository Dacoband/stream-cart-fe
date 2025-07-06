import axios from 'axios'
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
        // IsDeleted: data.IsDeleted ?? null,
      },
    })
    console.log(response)
    return response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

export const getDetailCategory = async (id: string) => {
  try {
    const response = await rootApi.get('categorys', {
      params: {
        id: id,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetch detail category', error)
  }
}

export const createCategory = async (createDTO: CreateCategoryDTO) => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}')
  const token = userData.token
  if (!token) {
    throw new Error('Vui lòng đăng nhập để thực hiện chứ năng này')
  }
  const response = await rootApi.post('categorys', createDTO, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
