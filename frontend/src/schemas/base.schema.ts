import { z } from 'zod'

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    code: z.number().optional(),
    status: z.number(),
    message: z.string(),
    data: dataSchema.optional()
  })

export interface ApiResponse<T> {
  code?: number
  status: number
  message: string
  data: T
}

export const PageResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    page: z.number(),
    totalPages: z.number(),
    limit: z.number(),
    totalItems: z.number()
  })

export interface PageResponse<T> {
  data: T
  page: number
  totalPages: number
  limit: number
  totalItems: number
}
