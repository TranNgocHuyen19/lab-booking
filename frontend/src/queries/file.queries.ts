import { createMutation } from '@/query-core'
import { uploadFile } from '@/services/file.service'

export const useUploadFileMutation = () => {
  return createMutation({
    mutationFn: ({ file, entityFolder }: { file: File; entityFolder?: string }) => uploadFile(file, entityFolder)
  })()
}
