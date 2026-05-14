import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BulkActionBarProps {
  selectedCount: number
  selectedText?: string
  primaryActionLabel?: string
  secondaryActionLabel?: string
  tertiaryActionLabel?: string
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
  onTertiaryAction?: () => void
  isLoading?: boolean
  className?: string
}

const BulkActionBar = ({
  selectedCount,
  selectedText = 'mục đã chọn',
  primaryActionLabel = 'Chấp nhận',
  secondaryActionLabel = 'Từ chối',
  tertiaryActionLabel = 'Hủy hệ thống',
  onPrimaryAction,
  onSecondaryAction,
  onTertiaryAction,
  isLoading = false,
  className
}: BulkActionBarProps) => {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
    >
      <div className='flex items-center gap-3 pl-2'>
        <span className='font-semibold text-gray-700'>
          Đã chọn <span className='text-[#153898] font-bold'>{selectedCount}</span> {selectedText}
        </span>
      </div>
      <div className='flex items-center gap-3'>
        {onPrimaryAction && (
          <Button
            variant='approve'
            size='sm'
            className='font-bold h-9 px-4 rounded-lg'
            onClick={onPrimaryAction}
            disabled={isLoading}
          >
            {primaryActionLabel}
          </Button>
        )}
        {onSecondaryAction && (
          <Button
            variant='reject'
            size='sm'
            className='font-bold h-9 px-4 rounded-lg'
            onClick={onSecondaryAction}
            disabled={isLoading}
          >
            {secondaryActionLabel}
          </Button>
        )}
        {onTertiaryAction && (
          <Button
            variant='warning'
            size='sm'
            className='font-bold h-9 px-4 rounded-lg'
            onClick={onTertiaryAction}
            disabled={isLoading}
          >
            {tertiaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export default BulkActionBar
