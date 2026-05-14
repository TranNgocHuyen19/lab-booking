import { Badge, badgeVariants } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type VariantProps } from 'class-variance-authority'

interface StatusToggleProps {
  value: boolean
  onToggle: () => void
  loading?: boolean
  labels?: {
    active: string
    inactive: string
  }
  variants?: {
    active: VariantProps<typeof badgeVariants>['variant']
    inactive: VariantProps<typeof badgeVariants>['variant']
  }
  className?: string
}

export const StatusToggle = ({
  value,
  onToggle,
  loading = false,
  labels = { active: 'Hoạt động', inactive: 'Không hoạt động' },
  variants = { active: 'active', inactive: 'inactive' },
  className
}: StatusToggleProps) => {
  return (
    <Badge
      variant={value ? variants.active : variants.inactive}
      className={cn(
        'cursor-pointer hover:opacity-80 transition-all whitespace-nowrap select-none',
        loading && 'opacity-50 pointer-events-none cursor-not-allowed',
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        if (!loading) onToggle()
      }}
    >
      {loading ? (
        <span className='flex items-center gap-1.5'>
          <span className='h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
          Đang xử lý...
        </span>
      ) : value ? (
        labels.active
      ) : (
        labels.inactive
      )}
    </Badge>
  )
}
