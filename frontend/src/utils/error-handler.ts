import type { UseFormSetError, FieldValues, Path } from 'react-hook-form'
import { toast } from 'sonner'
import axios from 'axios'
import { getErrorMessage } from '@/constants/error-messages'

type EntityErrorPayload = {
  message: string
  errors: {
    field: string
    message: string
  }[]
}

export class EntityError extends Error {
  status: 422
  payload: EntityErrorPayload

  constructor({ status, payload }: { status: 422; payload: EntityErrorPayload }) {
    super('Entity Error')
    this.status = status
    this.payload = payload
  }
}

export const handleErrorApi = <T extends FieldValues>({
  error,
  setError,
  duration
}: {
  error: unknown
  setError?: UseFormSetError<T>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((err) => {
      setError(err.field as Path<T>, {
        type: 'server',
        message: err.message
      })
    })
  } else if (axios.isAxiosError(error)) {
    const data = error.response?.data
    const message = getErrorMessage(data?.code, data?.message || 'Lỗi hệ thống, vui lòng thử lại sau', data?.data)

    toast.error('Thất bại', {
      description: message,
      duration: duration ?? 4000
    })
  } else {
    toast.error('Lỗi không xác định', {
      description: 'Đã có lỗi xảy ra, vui lòng liên hệ admin',
      duration: duration ?? 4000
    })
  }
}
