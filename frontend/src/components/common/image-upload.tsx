import * as React from 'react'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'

interface ImageUploadProps {
  label: string | React.ReactNode
  value?: string | number
  onChange: (base64: string, file?: File) => void
  disabled?: boolean
  width?: string
  height?: string
}

export const ImageUpload = ({
  label,
  value,
  onChange,
  disabled,
  width = 'w-full',
  height = 'h-40'
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (typeof value === 'string' && value.startsWith('http')) {
      setPreview(value)
    } else if (!value) {
      setPreview(null)
    }
  }, [value])

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setPreview(result)
        onChange(result, file)
      }
      reader.readAsDataURL(file)
    }
  }

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <FormItem>
      <FormLabel className='text-md font-semibold text-gray-700'>{label}</FormLabel>
      <FormControl>
        <div
          onDragEnter={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!disabled) setIsDragging(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!disabled) setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(false)
            if (disabled) return
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all overflow-hidden bg-white cursor-pointer group',
            width,
            height,
            preview ? 'border-primary' : 'border-gray-200 hover:border-primary/50',
            isDragging && 'border-primary bg-primary/5 scale-[1.01]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {preview ? (
            <>
              <img src={preview} className='absolute inset-0 w-full h-full object-cover' alt='Preview' />
              <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                <span className='text-white text-xs font-medium'>Nhấn để thay đổi</span>
              </div>
              <button
                type='button'
                onClick={onRemove}
                className='absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-white shadow-md z-20 transition-transform hover:scale-110'
              >
                <X className='h-4 w-4' />
              </button>
            </>
          ) : (
            <div className='flex flex-col items-center justify-center pointer-events-none'>
              <Upload
                className={cn(
                  'h-8 w-8 text-gray-400 mb-2 transition-transform group-hover:scale-110',
                  isDragging && 'text-primary'
                )}
              />
              <div className='flex flex-col items-center gap-1 px-4'>
                <span className='text-xs text-gray-600 font-semibold text-center'>Kéo thả hoặc click để chọn ảnh</span>
                <span className='text-[10px] text-gray-400 font-medium'>Định dạng: JPG, PNG, WEBP (Tối đa 5MB)</span>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      </FormControl>
      <FormMessage className='text-xs' />
    </FormItem>
  )
}
