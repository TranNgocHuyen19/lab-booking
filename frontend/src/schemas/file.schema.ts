import { z } from 'zod'

export const fileResponseSchema = z.object({
  id: z.number(),
  fileName: z.string(),
  size: z.number(),
  format: z.string(),
  resourceType: z.string(),
  url: z.string()
})

export type FileResponse = z.infer<typeof fileResponseSchema>
