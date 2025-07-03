import axios from 'axios'
import rootApi from '../../rootApi'
import { filterCategory } from '@/types/category/category'

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
