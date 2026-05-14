import { X, UserPlus, Loader2 } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MemberRole, MemberRoleLabel } from '@/constants/types'
import { Badge } from '@/components/ui/badge'

interface MemberCardProps {
  username: string
  fullName?: string
  role: string
  onRoleChange?: (role: string) => void
  onRemove?: () => void
  onAdd?: () => void
  isPending?: boolean
  availableRoles?: string[]
}

export const MemberCard = ({
  username,
  fullName,
  role,
  onRoleChange,
  onRemove,
  onAdd,
  isPending,
  availableRoles
}: MemberCardProps) => {
  const rolesToDisplay = availableRoles || Object.values(MemberRole)

  return (
    <div className='bg-white border border-gray-100 p-4 shadow-sm relative group animate-in fade-in zoom-in-95 duration-200'>
      <div className='flex items-center gap-4'>
        <UserAvatar name={fullName || username} className='h-12 w-12 border-2 border-white shadow-md' />

        <div className='flex-1 min-w-0 flex items-center justify-between gap-4'>
          <div className='flex flex-col min-w-0'>
            <h4 className='text-sm font-black text-gray-900 truncate'>{fullName || username}</h4>
            <p className='text-[10px] text-gray-400 font-black uppercase tracking-tight'>{username}</p>
          </div>

          <div className='flex items-center gap-3'>
            {onRoleChange && (
              <Select value={role} onValueChange={onRoleChange}>
                <SelectTrigger className='h-9 w-[130px] bg-gray-50/50 border-gray-100 text-[11px] font-black uppercase ring-offset-0 focus:ring-1 focus:ring-primary/20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-gray-100'>
                  {Object.entries(MemberRole)
                    .filter(([, value]) => rolesToDisplay.includes(value))
                    .map(([key, value]) => (
                      <SelectItem key={key} value={value} className='text-[11px] font-bold uppercase'>
                        {MemberRoleLabel[value as keyof typeof MemberRoleLabel]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}

            {!onRoleChange && !onAdd && (
              <Badge
                variant={role.toLowerCase() as 'leader' | 'co_leader' | 'member'}
                className='h-7 text-[10px] uppercase'
              >
                {MemberRoleLabel[role as keyof typeof MemberRoleLabel] || role}
              </Badge>
            )}

            {onAdd && (
              <Button
                type='button'
                size='icon'
                onClick={onAdd}
                disabled={isPending}
                className='h-9 w-9 bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 rounded-xl active:scale-95 transition-all'
              >
                {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <UserPlus className='h-4 w-4' />}
              </Button>
            )}

            {onRemove && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onRemove}
                className='h-8 w-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors'
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
