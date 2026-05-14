import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useResearchGroupDetailQuery, useAddMembersMutation } from '@/queries/research-group.queries'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserPlus, Shield, Users, Briefcase, Globe, Lock, Eye } from 'lucide-react'
import { UserAvatar } from '@/components/common/user-avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/contexts/AuthContext'
import {
  useApproveJoinRequestMutation,
  useRejectJoinRequestMutation,
  useCreateJoinRequestMutation,
  useCancelJoinRequestMutation,
  useGroupJoinRequestsQuery
} from '@/queries/group-join-request.queries'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'
import { StudentBreadcrumb } from '@/components/common/student-breadcrumb'
import { PATHS } from '@/constants/paths'
import type { GroupJoinRequestResponse, MemberInfoResponse } from '@/schemas/research-group.schema'
import DialogJoinRequestDetail from '@/components/student/research-group/dialog-join-request-detail'
import { DialogInviteMember } from '@/components/student/research-group/dialog-invite-member'
import { DialogCreateJoinRequest } from '@/components/student/research-group/dialog-create-join-request'
import { DialogConfirmCancelRequest } from '@/components/student/research-group/dialog-confirm-cancel-request'
import { LoginRequiredDialog } from '@/components/common/dialog-login-required'
import { isGroupManager, isGroupMember } from '@/utils/group-permission'
import { MemberRole, MemberRoleLabel, RequestStatus } from '@/constants/types'
import { DialogReject } from '@/components/common/dialog-reject'
import { GROUP_REJECTION_REASONS } from '@/constants/rejection-reasons'
import { XCircle } from 'lucide-react'

const ResearchGroupDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const groupId = Number(id)
  const { user, isAuthenticated } = useAuthContext()

  const { data: apiResponse, isLoading, isError } = useResearchGroupDetailQuery(groupId, isAuthenticated)
  const group = apiResponse?.data

  const { data: requestsData } = useGroupJoinRequestsQuery(groupId, {
    page: 1,
    size: 10,
    status: RequestStatus.PENDING
  })
  const pendingRequests = requestsData?.data?.data || []

  const [selectedRequest, setSelectedRequest] = useState<GroupJoinRequestResponse | null>(null)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const approveMutation = useApproveJoinRequestMutation()
  const rejectMutation = useRejectJoinRequestMutation()
  const addMembersMutation = useAddMembersMutation(groupId)
  const createJoinRequestMutation = useCreateJoinRequestMutation()
  const cancelJoinRequestMutation = useCancelJoinRequestMutation()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleJoinRequest = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setIsRequestDialogOpen(true)
  }

  // Handle invite with auth check
  const handleInvite = () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setIsInviteDialogOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!group?.requestId) return

    try {
      await cancelJoinRequestMutation.mutateAsync(group.requestId)
      toast.success('Đã huỷ yêu cầu tham gia thành công')
      setShowCancelDialog(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleApprove = async (requestId: number) => {
    try {
      await approveMutation.mutateAsync({ requestId })
      toast.success('Đã duyệt yêu cầu tham gia thành công')
      setSelectedRequest(null)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleReject = async (reason: string) => {
    if (!rejectId) return
    try {
      await rejectMutation.mutateAsync({
        requestId: rejectId,
        data: {
          responseNote: reason
        }
      })
      toast.success('Đã từ chối yêu cầu tham gia')
      setRejectId(null)
      setSelectedRequest(null)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
        <Loader2 className='h-10 w-10 text-primary animate-spin' />
        <p className='text-gray-400 font-bold animate-pulse'>Đang tải thông tin nhóm...</p>
      </div>
    )
  }

  if (isError || !group) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
        <p className='text-red-500 font-bold'>Không tìm thấy nhóm nghiên cứu hoặc có lỗi xảy ra.</p>
        <Button variant='outline' onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    )
  }

  const leaders = ('leaders' in group && Array.isArray(group.leaders) ? group.leaders : []) as MemberInfoResponse[]
  const members = ('members' in group && Array.isArray(group.members) ? group.members : []) as MemberInfoResponse[]

  const isMember = isGroupMember(group.memberRole)
  const isManager = isGroupManager(group.memberRole)

  return (
    <div className='bg-[#f8fafc] min-h-screen font-sans pb-20'>
      <div className='w-full px-6 md:px-20 lg:px-40 py-6'>
        <StudentBreadcrumb
          items={[{ label: 'Nhóm nghiên cứu', href: PATHS.STUDENT.GROUPS }, { label: group.groupName }]}
          className='mb-2'
        />
      </div>

      <div className='relative'>
        <div className='h-64 md:h-80 w-full bg-gradient-to-br from-[#153898] to-[#0a2361] relative overflow-hidden'>
          <div
            className='absolute inset-0 opacity-10'
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}
          />
          <div className='absolute top-6 right-8 z-20'>
            {group.isPrivate ? (
              <Badge variant='warning' className='px-4 py-2 rounded-xl shadow-lg'>
                <Lock className='h-4 w-4' /> Nhóm riêng tư
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-2 rounded-xl shadow-lg'
              >
                <Globe className='h-4 w-4' /> Nhóm công khai
              </Badge>
            )}
          </div>

          <div className='absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[1px]'>
            <svg
              viewBox='0 0 1200 120'
              preserveAspectRatio='none'
              className='relative block w-full h-[60px] fill-[#f8fafc]'
            >
              <path d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z'></path>
            </svg>
          </div>
        </div>

        <div className='w-full px-6 md:px-20 lg:px-40'>
          <div className='flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-24 gap-8 relative z-30 pb-4'>
            <div className='relative shrink-0'>
              <div className='w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-white p-2 shadow-2xl relative group'>
                <UserAvatar
                  name={group.groupName}
                  className='w-full h-full rounded-[2rem] bg-slate-50 border border-slate-100'
                  fallbackClassName='text-5xl font-black text-primary transition-transform duration-500 group-hover:scale-110'
                />
              </div>
            </div>

            <div className='flex flex-col md:flex-row md:items-end justify-between flex-1 gap-6 w-full pb-2'>
              <div className='space-y-1.5 text-center md:text-left'>
                <h1 className='text-3xl md:text-5xl font-black text-slate-900 tracking-tight'>{group.groupName}</h1>
                <div className='flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-bold pt-1'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-5 w-5 text-primary' />
                    <span className='text-slate-700'>{group.memberCount} thành viên tham gia</span>
                  </div>
                  <div className='h-1.5 w-1.5 rounded-full bg-slate-300 hidden md:block' />
                  <Badge
                    variant={group.groupType === 'RESEARCH' ? 'research' : 'thesis'}
                    className='px-4 py-1.5 text-xs uppercase tracking-widest'
                  >
                    {group.groupType}
                  </Badge>
                </div>
              </div>

              <div className='flex gap-4 items-center justify-center md:justify-end'>
                {isManager && (
                  <Button
                    className='h-12 px-8 bg-secondary hover:bg-secondary/95 text-black font-black shadow-lg shadow-secondary/20 active:translate-y-0.5 transition-all rounded-2xl gap-3'
                    onClick={handleInvite}
                  >
                    <UserPlus className='h-5 w-5' />
                    Mời thành viên
                  </Button>
                )}
                {!isMember && (
                  <>
                    {group.requestStatus === RequestStatus.PENDING ? (
                      <Button
                        className='h-12 px-8 bg-red-50 hover:bg-red-100 text-red-600 font-black shadow-lg shadow-red-200/20 active:translate-y-0.5 transition-all rounded-2xl gap-3 border border-red-100'
                        onClick={() => setShowCancelDialog(true)}
                      >
                        <XCircle className='h-5 w-5' />
                        Rút yêu cầu tham gia
                      </Button>
                    ) : (
                      <Button
                        className='h-12 px-8 bg-secondary hover:bg-secondary/95 text-black font-black shadow-lg shadow-secondary/20 active:translate-y-0.5 transition-all rounded-2xl gap-3'
                        onClick={handleJoinRequest}
                      >
                        <UserPlus className='h-5 w-5' />
                        {group.requestStatus === RequestStatus.REJECTED ? 'Gửi lại yêu cầu' : 'Yêu cầu tham gia nhóm'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='w-full px-6 md:px-20 lg:px-40 mt-10'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>
          <div className='lg:col-span-8 space-y-10'>
            <Card className='border-gray-100 shadow-sm rounded-2xl overflow-hidden'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-bold text-primary flex items-center gap-2'>
                  <div className='p-1.5 bg-primary/5 rounded-lg'>
                    <Shield className='h-5 w-5 text-primary' />
                  </div>
                  Giới thiệu chung
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <p className='text-gray-600 leading-relaxed text-[15px]'>
                  {group.description || 'Nhóm chưa có mô tả.'}
                </p>

                <div className='pt-6 border-t border-gray-50'>
                  <h4 className='font-bold text-gray-900 mb-4 text-sm flex items-center gap-2'>
                    <Briefcase className='h-4 w-4 text-primary' />
                    Đề tài & Dự án đang thực hiện:
                  </h4>
                  <div className='space-y-4'>
                    {group.projectName ? (
                      <div className='relative pl-4 border-l-4 border-primary/30 py-1 transition-all hover:border-primary'>
                        <h4 className='font-bold text-gray-900 text-[15px] mb-1.5 leading-snug'>{group.projectName}</h4>
                        <div className='flex items-center gap-2 text-xs font-bold'>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-md',
                              group.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-amber-50 text-amber-600'
                            )}
                          >
                            {group.status || 'Đang thực hiện'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className='text-gray-500 italic text-sm bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200'>
                        Hiện tại nhóm chưa có đề tài nghiên cứu chính thức.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-4 space-y-6'>
            {isManager && pendingRequests.length > 0 && (
              <Card className='border-orange-100 bg-orange-50/50 shadow-sm rounded-2xl overflow-hidden'>
                <CardHeader className='pb-3 flex flex-row items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-5 w-5 text-primary' />
                    <CardTitle className='text-base font-bold text-slate-800'>Yêu cầu tham gia</CardTitle>
                  </div>
                  <Badge className='bg-primary text-white hover:bg-primary/90 ml-auto h-6 w-6 flex items-center justify-center p-0 rounded-full font-bold'>
                    {pendingRequests.length}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {pendingRequests.map((req) => (
                      <div
                        key={req.requestId}
                        className='bg-white p-3 rounded-xl border border-orange-100 flex items-center justify-between shadow-sm hover:border-orange-200 transition-colors group/item'
                      >
                        <div className='flex items-center gap-3'>
                          <UserAvatar name={req.fullName} className='h-9 w-9 border border-gray-100' />
                          <div>
                            <div className='font-bold text-sm text-gray-900 leading-none mb-1'>{req.fullName}</div>
                            <div className='text-xs text-gray-500'>{req.username}</div>
                          </div>
                        </div>
                        <div className='flex gap-2 invisible group-hover/item:visible transition-all'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='h-8 px-3 text-xs font-bold gap-1.5 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary rounded-lg shadow-none'
                            onClick={() => setSelectedRequest(req)}
                          >
                            <Eye className='h-3.5 w-3.5' />
                            Xem đơn
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <DialogJoinRequestDetail
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onApprove={handleApprove}
                    onReject={setRejectId}
                    isProcessing={approveMutation.isPending || rejectMutation.isPending}
                    memberRole={group.memberRole}
                  />
                </CardContent>
              </Card>
            )}

            <Card className='border-gray-100 shadow-sm rounded-2xl overflow-hidden'>
              <CardHeader className='pb-2 flex flex-row items-center justify-between'>
                <CardTitle className='text-base font-bold text-gray-900'>Thành viên ({group.memberCount})</CardTitle>
                {isMember && (
                  <Button variant='link' className='text-primary font-bold text-xs h-auto p-0'>
                    Quản lý
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className='space-y-6 mt-4'>
                  <div>
                    <div className='text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4'>
                      Giảng viên hướng dẫn
                    </div>
                    {leaders.length > 0 ? (
                      <div className='space-y-3'>
                        {leaders.map((leader) => (
                          <div
                            key={leader.userId}
                            className='flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm shadow-blue-900/5 transition-all hover:bg-blue-50/80 hover:shadow-md'
                          >
                            <div className='flex items-center gap-4'>
                              <UserAvatar
                                name={leader.fullName}
                                className='h-14 w-14 border-2 border-white shadow-md'
                              />
                              <div>
                                <div className='font-bold text-base text-[#153898] uppercase tracking-tight'>
                                  {leader.fullName}
                                </div>
                                <div className='text-[12px] text-blue-500 font-bold uppercase tracking-tighter mt-1'>
                                  Giảng viên hướng dẫn
                                </div>
                              </div>
                            </div>
                            {leader.userId === user?.userId && (
                              <Badge className='bg-amber-400 text-black hover:bg-amber-500 border-none font-black text-[11px] px-3.5 h-7 rounded-full shadow-sm'>
                                You
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-gray-400 text-sm italic'>Chưa có giảng viên hướng dẫn</p>
                    )}
                  </div>

                  <div>
                    <div className='text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4'>
                      Thành viên
                    </div>
                    {isMember ? (
                      <div className='space-y-5'>
                        {members.map((member) => (
                          <div
                            key={member.userId}
                            className='flex items-center justify-between group px-1 rounded-xl transition-all hover:bg-gray-50/50'
                          >
                            <div className='flex items-center gap-4'>
                              <UserAvatar
                                name={member.fullName}
                                className='h-11 w-11 border border-gray-100 bg-gray-50'
                              />
                              <div>
                                <div className='font-bold text-base text-gray-700 group-hover:text-primary transition-colors flex items-center gap-2'>
                                  {member.fullName}
                                  {member.userId === user?.userId && (
                                    <Badge className='bg-amber-400 text-black border-none font-bold text-[10px] px-2 h-5 rounded-md uppercase'>
                                      You
                                    </Badge>
                                  )}
                                </div>
                                {member.role !== MemberRole.MEMBER && (
                                  <Badge
                                    variant={member.role.toLowerCase() as 'leader' | 'co_leader' | 'member'}
                                    className='mt-1 text-[10px] uppercase tracking-tighter'
                                  >
                                    {MemberRoleLabel[member.role as keyof typeof MemberRoleLabel]}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {members.length === 0 && (
                          <div className='flex flex-col items-center justify-center py-10 text-gray-400'>
                            <Users className='h-10 w-10 mb-3 opacity-20' />
                            <p className='text-sm italic font-medium'>Chưa có thành viên khác trong nhóm</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className='flex flex-col items-center justify-center py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200'>
                        <div className='p-3.5 bg-white rounded-full mb-3 shadow-sm'>
                          <Lock className='h-6 w-6 text-gray-400 outline-none border-none' />
                        </div>
                        <p className='text-gray-900 font-bold text-sm mb-1 uppercase tracking-tighter text-center w-full'>
                          Danh sách bị ẩn
                        </p>
                        <p className='text-gray-400 text-xs font-medium'>Vui lòng tham gia nhóm để xem đầy đủ</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <DialogInviteMember
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        groupId={groupId}
        onInvite={async (users: { username: string; role: 'MEMBER' | 'LEADER' }[]) => {
          try {
            await addMembersMutation.mutateAsync(users)
            toast.success('Đã mời thành viên thành công')
            setIsInviteDialogOpen(false)
          } catch (error) {
            handleErrorApi({ error })
          }
        }}
        isProcessing={addMembersMutation.isPending}
      />

      <DialogCreateJoinRequest
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        groupName={group.groupName}
        onSubmit={async (message) => {
          try {
            await createJoinRequestMutation.mutateAsync({ researchGroupId: groupId, message })
            toast.success('Đã gửi yêu cầu tham gia nhóm')
            setIsRequestDialogOpen(false)
          } catch (error) {
            handleErrorApi({ error })
          }
        }}
        isSubmitting={createJoinRequestMutation.isPending}
      />

      {group && (
        <DialogConfirmCancelRequest
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={handleConfirmCancel}
          isLoading={cancelJoinRequestMutation.isPending}
          groupName={group.groupName}
        />
      )}

      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

      <DialogReject
        open={!!rejectId}
        onOpenChange={(open) => !open && setRejectId(null)}
        onConfirm={handleReject}
        title='Xác nhận Từ Chối Yêu cầu tham gia'
        description='Vui lòng chọn hoặc nhập lý do từ chối yêu cầu tham gia của sinh viên này.'
        reasons={GROUP_REJECTION_REASONS}
        isLoading={rejectMutation.isPending}
      />
    </div>
  )
}

export default ResearchGroupDetailPage
