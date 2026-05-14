import { useState, useEffect } from 'react'
import { useSearchUsersToInviteQuery } from '@/queries/research-group.queries'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/common/user-avatar'
import { Loader2, Search, UserPlus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserResponse } from '@/schemas/user.schema'

interface DialogInviteMemberProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: number
  onInvite: (users: { username: string; role: 'MEMBER' | 'LEADER' }[]) => void
  isProcessing?: boolean
}

export const DialogInviteMember = ({
  open,
  onOpenChange,
  groupId,
  onInvite,
  isProcessing = false
}: DialogInviteMemberProps) => {
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([])

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
    }, 300)
    return () => clearTimeout(timer)
  }, [keyword])

  // Reset state when dialog opens (not closes, to avoid sync setState issues)
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset will happen on next open
      setTimeout(() => {
        setKeyword('')
        setDebouncedKeyword('')
        setSelectedUsers([])
      }, 200)
    }
    onOpenChange(isOpen)
  }

  const { data: searchResult, isLoading } = useSearchUsersToInviteQuery({
    groupId,
    keyword: debouncedKeyword,
    page: 1,
    size: 10,
    enabled: open && !!debouncedKeyword
  })

  const users: UserResponse[] = searchResult || []

  const toggleUserSelection = (user: UserResponse) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.userId === user.userId)
      if (isSelected) {
        return prev.filter((u) => u.userId !== user.userId)
      }
      return [...prev, user]
    })
  }

  const isUserSelected = (userId: number) => {
    return selectedUsers.some((u) => u.userId === userId)
  }

  const handleInvite = () => {
    const usersToInvite = selectedUsers.map((u) => ({
      username: u.username,
      role: 'MEMBER' as const
    }))
    onInvite(usersToInvite)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[600px] border-none shadow-2xl rounded-xl overflow-hidden p-0'>
        <div className='p-8 pb-4 bg-gray-50/50 border-b border-gray-100/50'>
          <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>
            Mời thành viên
          </DialogTitle>
          <DialogDescription className='text-sm font-medium text-gray-500 mt-1'>
            Tìm kiếm và mời thành viên mới vào nhóm nghiên cứu của bạn.
          </DialogDescription>
        </div>

        <div className='p-8 pt-6 space-y-6'>
          <div className='relative group'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors' />
            <Input
              placeholder='Nhập MSSV, MSNV hoặc tên...'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='pl-12 h-12 border-gray-200 rounded-2xl bg-white shadow-sm transition-all focus:ring-2 focus:ring-primary/10'
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className='animate-in fade-in slide-in-from-top-2 duration-300'>
              <div className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1'>
                Đã chọn ({selectedUsers.length})
              </div>
              <div className='flex flex-wrap gap-2'>
                {selectedUsers.map((user) => (
                  <div
                    key={user.userId}
                    className='flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm'
                  >
                    <span>{user.fullName}</span>
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className='hover:bg-primary/10 rounded-full p-0.5 transition-colors'
                    >
                      <X className='h-3.5 w-3.5' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-3'>
            {isLoading ? (
              <div className='flex flex-col items-center justify-center py-16 gap-4'>
                <Loader2 className='h-10 w-10 text-primary animate-spin' />
                <span className='text-xs font-black uppercase text-gray-400 tracking-widest'>Đang tìm kiếm...</span>
              </div>
            ) : users.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 gap-4 opacity-50'>
                <div className='h-16 w-16 rounded-3xl bg-gray-50 flex items-center justify-center'>
                  <Search className='h-8 w-8 text-gray-300' />
                </div>
                <p className='text-xs font-black uppercase text-gray-400 tracking-widest'>
                  {keyword ? 'Không tìm thấy người dùng' : 'Nhập từ khóa để tìm kiếm'}
                </p>
              </div>
            ) : (
              <div className='grid gap-2'>
                {users.map((user) => {
                  const selected = isUserSelected(user.userId)
                  return (
                    <div
                      key={user.userId}
                      onClick={() => toggleUserSelection(user)}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 group',
                        selected
                          ? 'bg-primary/5 border-primary/20 shadow-md ring-1 ring-primary/10'
                          : 'bg-white border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5'
                      )}
                    >
                      <div className='flex items-center gap-4'>
                        <UserAvatar name={user.fullName} className='h-11 w-11 border-2 border-white shadow-sm' />
                        <div className='flex flex-col'>
                          <div className='font-black text-sm text-gray-900'>{user.fullName}</div>
                          <div className='text-[10px] font-bold text-gray-400 uppercase tracking-tight'>
                            {user.username} • {user.iuhEmail}
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300',
                          selected
                            ? 'bg-primary border-primary rotate-0'
                            : 'border-gray-200 group-hover:border-primary/30 rotate-90'
                        )}
                      >
                        {selected ? (
                          <Check className='h-3.5 w-3.5 text-white' />
                        ) : (
                          <div className='w-1 h-1 rounded-full bg-gray-300 group-hover:bg-primary/30' />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3'>
          <Button
            variant='ghost'
            className='font-black text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl px-6 h-11 uppercase text-[11px] tracking-wider transition-all'
            onClick={() => onOpenChange(false)}
          >
            Hủy bỏ
          </Button>
          <Button
            className='bg-primary hover:bg-primary/95 text-white font-black rounded-xl px-8 h-11 uppercase text-[11px] tracking-wider gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95'
            onClick={handleInvite}
            disabled={selectedUsers.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <>
                <UserPlus className='h-4 w-4' />
                Gửi lời mời {selectedUsers.length > 0 && `(${selectedUsers.length})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
