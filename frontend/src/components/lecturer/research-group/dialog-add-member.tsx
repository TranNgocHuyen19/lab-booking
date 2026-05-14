import { useState } from 'react'
import { Search, Loader2, HelpCircle, UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { useSearchUsersToInviteQuery, useAddMembersMutation } from '@/queries/research-group.queries'
import { MemberCard } from './member-card'
import { MemberRole, MemberRoleLabel } from '@/constants/types'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'
import type { UserResponse } from '@/schemas/user.schema'
import type { MemberInfoResponse } from '@/schemas/research-group.schema'

interface DialogAddMemberProps {
  groupId: number
  currentMembers: MemberInfoResponse[]
  children?: React.ReactNode
}

export const DialogAddMember = ({ groupId, currentMembers, children }: DialogAddMemberProps) => {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 400)
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({})

  const { data: searchResult, isLoading: isSearching } = useSearchUsersToInviteQuery({
    groupId,
    keyword: debouncedKeyword,
    page: 1,
    size: 10,
    enabled: !!debouncedKeyword && open
  })

  const addMembersMutation = useAddMembersMutation(groupId)
  const users: UserResponse[] = searchResult || []

  const handleAddMember = async (user: UserResponse) => {
    try {
      const role = selectedRoles[user.username] || MemberRole.MEMBER
      await addMembersMutation.mutateAsync([{ username: user.username, role }])
      toast.success(
        `Đã thêm ${user.fullName} vào nhóm với vai trò ${MemberRoleLabel[role as keyof typeof MemberRoleLabel]}`
      )
      setKeyword('')
      setSelectedRoles((prev) => {
        const next = { ...prev }
        delete next[user.username]
        return next
      })
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const isAlreadyMember = (username: string) => {
    return currentMembers.some((m) => m.username === username)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            type='button'
            size='icon'
            className='h-10 w-10 bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 rounded-xl'
          >
            <UserPlus className='h-5 w-5' />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[550px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50'>
          <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>
            Thêm thành viên mới
          </DialogTitle>
          <DialogDescription className='text-sm font-medium'>
            Tìm kiếm sinh viên hoặc giảng viên để mời vào nhóm nghiên cứu.
          </DialogDescription>
        </DialogHeader>
        <div className='p-8 pt-4 space-y-6'>
          <div className='relative group'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors' />
            <Input
              placeholder='Nhập MSSV, MSNV hoặc tên...'
              className='pl-12 h-12 border-gray-200 rounded-2xl'
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className='max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3'>
            {isSearching ? (
              <div className='flex flex-col items-center justify-center py-12 gap-4'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
                <span className='text-xs font-black uppercase text-gray-400 tracking-widest'>Đang tìm kiếm...</span>
              </div>
            ) : keyword && users.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 gap-4 opacity-50'>
                <HelpCircle className='h-12 w-12 text-gray-300' />
                <p className='text-sm font-bold uppercase text-gray-400'>Không tìm thấy người dùng phù hợp</p>
              </div>
            ) : (
              users.map((user) => {
                const member = isAlreadyMember(user.username)
                return (
                  <MemberCard
                    key={user.userId}
                    username={user.username}
                    fullName={user.fullName}
                    role={selectedRoles[user.username] || MemberRole.MEMBER}
                    onRoleChange={
                      !member ? (value) => setSelectedRoles((prev) => ({ ...prev, [user.username]: value })) : undefined
                    }
                    onAdd={!member ? () => handleAddMember(user) : undefined}
                    isPending={addMembersMutation.isPending}
                    availableRoles={[MemberRole.MEMBER, MemberRole.CO_LEADER]}
                  />
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
