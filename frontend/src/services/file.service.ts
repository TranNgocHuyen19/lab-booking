import http from '@/lib/http'
import { type ApiResponse } from '@/schemas/base.schema'
import type { FileResponse } from '@/schemas/file.schema'

export const uploadFile = async (file: File, entityFolder: string = 'students'): Promise<FileResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await http.post<ApiResponse<FileResponse>>(`/files/upload?entityFolder=${entityFolder}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data.data
}

export const uploadMultipleFiles = async (
  files: File[],
  entityFolder: string = 'students'
): Promise<FileResponse[]> => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  const response = await http.post<ApiResponse<FileResponse[]>>(
    `/files/upload-multiple?entityFolder=${entityFolder}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return response.data.data
}
