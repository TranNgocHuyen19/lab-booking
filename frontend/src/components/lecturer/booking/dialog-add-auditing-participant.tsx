import { useState } from 'react'
import { Search, Loader2, HelpCircle, UserPlus, UserCircle2 } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/use-debounce'
import { useSearchUsersQuery } from '@/queries/user.queries'
import { UserAvatar } from '@/components/common/user-avatar'
import type { UserResponse } from '@/schemas/user.schema'
import { ParticipantRole, ParticipantRoleLabels } from '@/constants/types'

export interface AuditingParticipant {
  userId: number
  username: string
  fullName: string
  role: typeof ParticipantRole.COMMITTEE | typeof ParticipantRole.OBSERVER
}

interface DialogAddAuditingParticipantProps {
  onAdd: (participant: AuditingParticipant) => void
  currentParticipants: AuditingParticipant[]
  excludedUsernames?: string[]
  children?: React.ReactNode
}

export const DialogAddAuditingParticipant = ({
  onAdd,
  currentParticipants,
  excludedUsernames = [],
  children
}: DialogAddAuditingParticipantProps) => {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 400)
  const [selectedRoles, setSelectedRoles] = useState<
    Record<string, typeof ParticipantRole.COMMITTEE | typeof ParticipantRole.OBSERVER>
  >({})

  const { data: users = [], isLoading: isSearching } = useSearchUsersQuery({
    keyword: debouncedKeyword,
    page: 1,
    size: 10
  })

  const handleAdd = (user: UserResponse) => {
    const role = selectedRoles[user.username] || ParticipantRole.OBSERVER
    onAdd({
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      role
    })
    setKeyword('')
    setSelectedRoles((prev) => {
      const next = { ...prev }
      delete next[user.username]
      return next
    })
  }

  const isAlreadyAdded = (username: string) => {
    return currentParticipants.some((p) => p.username === username) || excludedUsernames.includes(username)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-9 border-2 border-[#153898]/20 text-[#153898] hover:bg-blue-50 hover:border-[#153898] rounded-xl font-bold uppercase text-[11px] tracking-wider'
          >
            <UserPlus className='h-4 w-4 mr-2' />
            Thêm thành viên dự thính
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[550px] p-0 overflow-hidden rounded-xl border-none shadow-2xl'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50'>
          <DialogTitle className='text-2xl font-black uppercase text-[#153898] tracking-tight'>
            Thêm thành viên dự thính
          </DialogTitle>
          <DialogDescription className='text-sm font-medium'>
            Tìm kiếm sinh viên hoặc giảng viên bằng tên hoặc mã số để thêm vào danh sách dự thính/hội đồng.
          </DialogDescription>
        </DialogHeader>
        <div className='p-8 pt-4 space-y-6'>
          <div className='relative group'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#153898] transition-colors' />
            <Input
              placeholder='Nhập MSSV, MSNV hoặc tên...'
              className='pl-12 h-12 border-gray-200 rounded-xl focus:ring-[#153898]/20'
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className='max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-3'>
            {isSearching ? (
              <div className='flex flex-col items-center justify-center py-12 gap-4'>
                <Loader2 className='h-8 w-8 animate-spin text-[#153898]' />
                <span className='text-xs font-black uppercase text-gray-400 tracking-widest'>Đang tìm kiếm...</span>
              </div>
            ) : keyword && users.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 gap-4 opacity-50'>
                <HelpCircle className='h-12 w-12 text-gray-300' />
                <p className='text-sm font-bold uppercase text-gray-400'>Không tìm thấy người dùng phù hợp</p>
              </div>
            ) : (
              users.map((user) => {
                const added = isAlreadyAdded(user.username)
                const currentRole = selectedRoles[user.username] || 'OBSERVER'

                return (
                  <div
                    key={user.userId}
                    className='bg-white border border-gray-100 p-4 shadow-sm relative group animate-in fade-in zoom-in-95 duration-200'
                  >
                    <div className='flex items-center gap-4'>
                      <UserAvatar name={user.fullName} className='h-12 w-12 border-2 border-white shadow-md' />
                      <div className='flex-1 min-w-0 flex items-center justify-between gap-4'>
                        <div className='flex flex-col min-w-0'>
                          <h4 className='text-sm font-black text-gray-900 truncate'>{user.fullName}</h4>
                          <p className='text-[10px] text-gray-400 font-black uppercase tracking-tight'>
                            {user.username} - {user.role === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'}
                          </p>
                        </div>

                        {!added ? (
                          <div className='flex items-center gap-3'>
                            <Select
                              value={currentRole}
                              onValueChange={(
                                val: typeof ParticipantRole.COMMITTEE | typeof ParticipantRole.OBSERVER
                              ) => setSelectedRoles((prev) => ({ ...prev, [user.username]: val }))}
                            >
                              <SelectTrigger className='h-9 w-[130px] bg-gray-50/50 border-gray-100 text-[11px] font-black uppercase ring-offset-0 focus:ring-1 focus:ring-[#153898]/20'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className='border-gray-100'>
                                <SelectItem
                                  value={ParticipantRole.COMMITTEE}
                                  className='text-[11px] font-bold uppercase'
                                >
                                  {ParticipantRoleLabels[ParticipantRole.COMMITTEE]}
                                </SelectItem>
                                <SelectItem
                                  value={ParticipantRole.OBSERVER}
                                  className='text-[11px] font-bold uppercase'
                                >
                                  {ParticipantRoleLabels[ParticipantRole.OBSERVER]}
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              type='button'
                              size='icon'
                              onClick={() => handleAdd(user)}
                              className='h-9 w-9 bg-[#153898] hover:bg-[#153898]/95 text-white shadow-lg shadow-[#153898]/20 rounded-xl active:scale-95 transition-all'
                            >
                              <UserPlus className='h-4 w-4' />
                            </Button>
                          </div>
                        ) : (
                          <span className='text-[10px] font-black uppercase text-green-500 bg-green-50 px-3 py-1 rounded-full'>
                            Đã thêm
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {!keyword && (
              <div className='flex flex-col items-center justify-center py-12 gap-4 text-gray-400'>
                <UserCircle2 className='h-12 w-12 opacity-20' />
                <p className='text-xs font-bold uppercase tracking-widest'>Nhập thông tin để bắt đầu tìm kiếm</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
