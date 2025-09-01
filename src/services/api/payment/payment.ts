import {
  DepositRequest,
  DepositResponse,
  WithdrawalApprovalRequest,
  WithdrawalApprovalResponse,
} from '@/types/payment/payment'
import rootApi from '../../rootApi'
import { AxiosError } from 'axios'

export const createQRPayment = async (orderIds: string[]) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.post(
      'payments/generate-qr-code',
      {
        orderIds: orderIds,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Error creating QR payment:', error)
    throw error
  }
}
export const createWithdrawalApproval = async (
  payload: WithdrawalApprovalRequest
): Promise<WithdrawalApprovalResponse> => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not found token.')
    }

    const response = await rootApi.post<WithdrawalApprovalResponse>(
      'payments/withdrawal-approval',
      {
        walletTransactionId: payload.walletTransactionId,
        ...(payload.approvalNote ? { approvalNote: payload.approvalNote } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Error creating withdrawal approval:', error)

    const message = (error as Error).message
    throw new Error(message || 'Failed to create withdrawal approval.')
  }
}

export const createDeposit = async (
  payload: DepositRequest
): Promise<DepositResponse> => {
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Not found token.')

    // (Optional) validate nhẹ phía client để fail sớm
    if (typeof payload.amount !== 'number' || isNaN(payload.amount)) {
      throw new Error('Amount is invalid.')
    }
    if (payload.amount < 10_000 || payload.amount > 50_000_000) {
      throw new Error('Số tiền nạp phải từ 10.000đ đến 50.000.000đ')
    }

    const body: any = {
      amount: payload.amount,
      ...(payload.shopId ? { shopId: payload.shopId } : {}),
      ...(payload.description ? { description: payload.description } : {}),
    }

    const res = await rootApi.post<DepositResponse>('payments/deposit', body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return res.data
  } catch (error) {
    console.error('Error creating deposit:', error)
    const err = error as AxiosError<{ message?: string; errors?: string[] }>
    const message = err?.response?.data?.errors?.[0] || (error as Error).message
    throw new Error(message || 'Failed to create deposit.')
  }
}
