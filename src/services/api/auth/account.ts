import rootApi from '../../rootApi'
import { UpdateUser } from '@/types/auth/user'
export const updateUserById = async (userId: string, data: UpdateUser) => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('Không tìm thấy token.')
  }

  const response = await rootApi.put(`accounts/${userId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}
export const deletesUserById = async (userId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Không tìm thấy token.')
    }

    const response = await rootApi.delete(`accounts/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error delete user:', error)
    throw error
  }
}

export const getUserById = async (userId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Không tìm thấy token.')
    }

    const response = await rootApi.get(`accounts/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log('account', response)
    return response.data?.data || null
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    throw new Error('Xảy ra lỗi trong quá trình tải thông tin người dùng.')
  }
}
export const getUserByShopId = async (shopId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Không tìm thấy token.')
    }

    const response = await rootApi.get(`/accounts/by-shop/${shopId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log('account', response)
    return response.data?.data || null
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    throw new Error('Xảy ra lỗi trong quá trình tải thông tin người dùng.')
  }
}

export const getUsersByRole = async (role: number) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Không tìm thấy token.')
    }

    const response = await rootApi.get(`accounts/by-role/${role}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log('users by role', response)
    return response.data?.data || []
  } catch (error) {
    console.error('Error fetching users by role:', error)
    throw new Error('Xảy ra lỗi trong quá trình tải danh sách người dùng.')
  }
}

export const getAllUsersForAdmin = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Không tìm thấy token.')
    }

    // Chỉ lấy users từ role 1, 2, 3, 5 (Customer, Seller, Moderator, OperationManager)
    const allowedRoles = [1, 2, 3, 5]
    const allUsers = []

    for (const role of allowedRoles) {
      try {
        const users = await getUsersByRole(role)
        allUsers.push(...users)
      } catch (error) {
        console.error(`Error fetching users for role ${role}:`, error)
        // Continue with other roles even if one fails
      }
    }

    return allUsers
  } catch (error) {
    console.error('Error fetching all users:', error)
    throw new Error('Xảy ra lỗi trong quá trình tải danh sách người dùng.')
  }
}
