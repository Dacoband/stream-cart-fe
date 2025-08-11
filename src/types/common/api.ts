// Common API error type for the entire application
export interface ApiError {
  response?: {
    data?: {
      message?: string
      errors?: Record<string, string[]>
    }
    status?: number
  }
  message?: string
  status?: number
}

// Type guard to check if error is ApiError
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'message' in error)
  )
}

// Helper function to extract error message from ApiError
export const getErrorMessage = (
  error: unknown,
  defaultMessage: string = 'Đã xảy ra lỗi. Vui lòng thử lại!'
): string => {
  if (isApiError(error)) {
    return error.response?.data?.message || error.message || defaultMessage
  }

  if (error instanceof Error) {
    return error.message || defaultMessage
  }

  return defaultMessage
}
