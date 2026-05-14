import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/common/user-avatar'
import { Users, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RequestStatus, MemberRole, MemberRoleLabel } from '@/constants/types'
import type { ResearchGroupResponse } from '@/schemas/research-group.schema'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/paths'
import { useState } from 'react'
import { useCancelJoinRequestMutation } from '@/queries/group-join-request.queries'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'
import { DialogConfirmCancelRequest } from './dialog-confirm-cancel-request'
import { XCircle } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

interface ResearchGroupCardProps {
  group: ResearchGroupResponse
  tab: 'all' | 'mine'
  onJoinRequest?: (groupId: number, groupName: string) => void
  isJoining?: boolean
}

export const ResearchGroupCard = ({ group, tab, onJoinRequest, isJoining = false }: ResearchGroupCardProps) => {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const cancelMutation = useCancelJoinRequestMutation()

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (group.isPrivate) {
      handleDetailClick()
      return
    }

    if (
      onJoinRequest &&
      group.requestStatus !== RequestStatus.PENDING &&
      group.requestStatus !== RequestStatus.APPROVED
    ) {
      onJoinRequest(group.researchGroupId, group.groupName)
    }
  }

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowCancelDialog(true)
  }

  const handleConfirmCancel = async () => {
    if (!group.requestId) {
      toast.error('Không tìm thấy ID yêu cầu để huỷ')
      return
    }

    try {
      await cancelMutation.mutateAsync(group.requestId)
      toast.success('Đã huỷ yêu cầu tham gia thành công')
      setShowCancelDialog(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleDetailClick = () => {
    navigate(`${PATHS.STUDENT.GROUPS}/${group.researchGroupId}`)
  }

  const getBorderTopColor = () => {
    if (group.requestStatus === RequestStatus.PENDING) {
      return 'from-amber-400 to-amber-600'
    }
    if (group.requestStatus === RequestStatus.REJECTED) {
      return 'from-red-400 to-red-600'
    }

    if (tab === 'mine' && group.memberRole) {
      if (group.memberRole === 'LEADER') {
        return 'from-secondary via-amber-400 to-primary/80'
      }
      if (group.memberRole === 'CO_LEADER') {
        return 'from-orange-400 to-red-500'
      }
      return 'from-primary to-blue-400'
    }
    return group.isPrivate ? 'from-gray-200 to-gray-300' : 'from-emerald-400 to-emerald-600'
  }

  return (
    <>
      <Card
        onClick={handleDetailClick}
        className={cn(
          'group border border-gray-100/50 shadow-sm hover:shadow-[0_20px_50px_-15px_rgba(21,56,152,0.1)] transition-all duration-500 rounded-xl overflow-hidden bg-white flex flex-col h-full relative cursor-pointer',
          'hover:-translate-y-1.5'
        )}
      >
        <div className={cn('absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r', getBorderTopColor())} />
        <div className='absolute top-0 right-0 z-10'>
          {group.requestStatus === RequestStatus.PENDING && (
            <Badge
              variant='pending'
              className='rounded-none rounded-bl-2xl px-4 py-1.5 text-[11px] uppercase tracking-wider shadow-sm font-black'
            >
              Đang chờ duyệt
            </Badge>
          )}
          {group.requestStatus === RequestStatus.REJECTED && (
            <Badge
              variant='rejected'
              className='rounded-none rounded-bl-2xl px-4 py-1.5 text-[11px] uppercase tracking-wider shadow-sm font-black'
            >
              Bị từ chối
            </Badge>
          )}
          {tab === 'mine' && group.memberRole && (
            <Badge
              variant={
                group.memberRole === 'LEADER' ? 'leader' : group.memberRole === 'CO_LEADER' ? 'co_leader' : 'member'
              }
              className='rounded-none rounded-bl-2xl px-4 py-1.5 text-[11px] uppercase tracking-wider shadow-sm'
            >
              {MemberRoleLabel[group.memberRole as keyof typeof MemberRoleLabel]}
            </Badge>
          )}
        </div>

        <div className='p-8 pt-6 flex-1 flex flex-col'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-2'>
              {tab === 'mine' && (
                <Badge variant={group.isPrivate ? 'outline' : 'success-soft'} className='px-4 py-1.5 text-[12px]'>
                  <div className={cn('w-2 h-2 rounded-full', group.isPrivate ? 'bg-gray-400' : 'bg-success')} />
                  {group.isPrivate ? 'Private' : 'Public'}
                </Badge>
              )}

              <Badge
                variant={group.groupType === 'RESEARCH' ? 'research' : 'thesis'}
                className='px-4 py-1.5 text-[12px]'
              >
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    group.groupType === 'RESEARCH' ? 'bg-sky-500' : 'bg-orange-500'
                  )}
                />
                {group.groupType === 'RESEARCH' ? 'Nghiên cứu' : 'Khóa luận'}
              </Badge>
            </div>

            <div className='flex items-center gap-2 text-gray-500 font-bold text-sm'>
              <Users className='h-4 w-4' />
              {group.memberCount || 0} thành viên
            </div>
          </div>

          <h3 className='text-3xl font-black text-gray-900 mb-3 leading-tight tracking-tight'>{group.groupName}</h3>

          <p className='text-gray-600 text-[15px] font-medium leading-relaxed mb-6 line-clamp-3'>{group.description}</p>

          <div className='h-px bg-gray-50 w-full mb-6' />

          <div className='flex items-center justify-between gap-4 mb-8'>
            <div className='flex items-center gap-4'>
              <UserAvatar
                name={group.leaderName ?? ''}
                className='h-12 w-12 border-[3px] border-white shadow-sm ring-1 ring-gray-100 font-bold'
              />
              <div className='flex flex-col'>
                <div className='text-base font-black text-gray-900 leading-none flex items-center gap-2'>
                  {group.leaderName}
                  {group.leaderName === user?.fullName && (
                    <Badge className='bg-amber-400 text-black border-none font-bold text-[10px] px-2 h-5 rounded-md uppercase'>
                      You
                    </Badge>
                  )}
                </div>
                <div className='text-[13px] font-bold text-gray-400 mt-1.5'>{MemberRoleLabel[MemberRole.LEADER]}</div>
              </div>
            </div>
          </div>

          <div className='mt-auto flex gap-3'>
            {tab === 'all' ? (
              <>
                {group.requestStatus === RequestStatus.PENDING ? (
                  <Button
                    onClick={handleCancelClick}
                    variant='outline'
                    className='flex-1 h-12 rounded-2xl font-black text-md transition-all border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 shadow-sm flex items-center justify-center gap-2'
                  >
                    <XCircle className='h-5 w-5' />
                    Rút yêu cầu tham gia
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoinClick}
                    disabled={group.requestStatus === RequestStatus.APPROVED || isJoining}
                    className={cn(
                      'flex-1 h-12 rounded-2xl font-black text-md transition-all',
                      group.requestStatus === RequestStatus.REJECTED
                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-sm'
                        : group.isPrivate
                          ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200'
                          : 'bg-primary text-white hover:bg-primary/95 shadow-sm border border-primary/20'
                    )}
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className='h-5 w-5 animate-spin mr-2' />
                        Đang gửi...
                      </>
                    ) : group.requestStatus === RequestStatus.APPROVED ? (
                      'Đã tham gia'
                    ) : group.requestStatus === RequestStatus.REJECTED ? (
                      'Gửi lại yêu cầu'
                    ) : group.isPrivate ? (
                      'Xem chi tiết'
                    ) : (
                      'Yêu cầu tham gia'
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={handleDetailClick}
                className='flex-1 h-12 rounded-2xl font-black text-md transition-all bg-primary text-white hover:bg-primary/95 shadow-sm border border-primary/20 flex items-center justify-center gap-2'
              >
                Truy cập vào nhóm <ArrowRight className='h-5 w-5' />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <DialogConfirmCancelRequest
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleConfirmCancel}
        isLoading={cancelMutation.isPending}
        groupName={group.groupName}
      />
    </>
  )
}
