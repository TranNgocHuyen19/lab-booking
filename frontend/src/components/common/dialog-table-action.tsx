import { MoreVertical, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface ActionItem {
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'default' | 'destructive'
  className?: string
}

interface DialogTableActionProps {
  actions: ActionItem[]
  children?: React.ReactNode
}

export function DialogTableAction({ actions, children }: DialogTableActionProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0 hover:bg-gray-100 data-[state=open]:bg-gray-100 rounded-full'>
          <MoreVertical className='h-4 w-4 text-gray-500' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px] rounded-xl p-1 shadow-lg border-gray-100'>
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              className={cn(
                'cursor-pointer py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                action.variant === 'destructive'
                  ? 'text-red-600 focus:text-red-600 focus:bg-red-50'
                  : 'text-gray-700 focus:bg-gray-50',
                action.className
              )}
            >
              {Icon && <Icon className={cn('mr-2 h-4 w-4', action.variant === 'destructive' && 'text-red-600')} />}
              {action.label}
            </DropdownMenuItem>
          )
        })}
        {children && (
          <>
            {actions.length > 0 && <DropdownMenuSeparator className='my-1 bg-gray-100' />}
            {children}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
