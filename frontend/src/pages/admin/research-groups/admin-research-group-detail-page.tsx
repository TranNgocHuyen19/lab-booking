import { useNavigate, useParams, Link } from 'react-router'
import {
  ChevronLeft,
  Edit,
  Users,
  Info,
  Shield,
  Briefcase,
  MoreVertical,
  UserMinus,
  Eye,
  Calendar,
  Clock,
  Lock,
  Globe,
  Fingerprint,
  UserPlus,
  Crown
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/common/user-avatar'
import {
  MemberRole,
  MemberRoleLabel,
  RequestStatus,
  type MemberRoleType,
  GroupTypeLabel,
  type GroupTypeType
} from '@/constants/types'
import { useGroupJoinRequestsQuery } from '@/queries/group-join-request.queries'
import { PATHS } from '@/constants/paths'
import { useGroupDetailAdminQuery, useUpdateMemberRoleMutation } from '@/queries/research-group.queries'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LecturerLoading } from '@/components/common/lecturer-loading'
import { formatDateTime } from '@/utils/format'
import { cn } from '@/lib/utils'

const AdminResearchGroupDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const groupId = Number(id)

  const { data: detailData, isLoading } = useGroupDetailAdminQuery(groupId)
  const group = detailData?.data
  const studentMembers = group?.members?.filter((m) => m.role !== MemberRole.LEADER) || []

  const { data: requestsData } = useGroupJoinRequestsQuery(groupId, {
    page: 1,
    size: 5,
    status: RequestStatus.PENDING
  })
  const pendingJoinRequests = requestsData?.data?.data || []

  const updateRoleMutation = useUpdateMemberRoleMutation(groupId)

  const handleUpdateRole = async (username: string, role: string) => {
    try {
      await updateRoleMutation.mutateAsync({ username, role })
      toast.success(role === MemberRole.CO_LEADER ? 'Đã bổ nhiệm làm trưởng nhóm' : 'Đã huỷ vai trò trưởng nhóm')
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  if (isLoading) {
    return <LecturerLoading message='Đang tải thông tin nhóm...' />
  }

  if (!group) {
    return (
      <div>
        <div className='text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm'>
          <Info className='h-16 w-16 text-gray-300 mx-auto mb-4' />
          <h2 className='text-xl font-bold text-gray-900 mb-2'>Không tìm thấy dữ liệu</h2>
          <p className='text-gray-500 mb-6'>Thông tin nhóm nghiên cứu này không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={() => navigate(PATHS.ADMIN.RESEARCH_GROUPS)}>Quay lại danh sách</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='w-full'>
        <div className='mb-8'>
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => navigate(-1)}
                  className='rounded-full h-10 w-10 hover:bg-white'
                >
                  <ChevronLeft className='h-6 w-6' />
                </Button>
                <div className='flex flex-col'>
                  <div className='flex items-center gap-3'>
                    <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>{group.groupName}</h1>
                    <Badge variant='secondary' className='h-5 px-2 text-[10px] font-black uppercase'>
                      {GroupTypeLabel[group.groupType as GroupTypeType]}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2 ml-14 text-gray-500'>
                <Info className='h-4 w-4 shrink-0' />
                <span className='font-medium'>{group.projectName || 'Chưa có tên đề tài'}</span>
              </div>
            </div>

            <div className='flex gap-3 ml-14 md:ml-0'>
              <Button
                className='h-12 px-8 bg-white text-gray-900 border-gray-200 hover:bg-gray-50 font-bold shadow-sm'
                variant='outline'
                asChild
              >
                <Link to={PATHS.ADMIN.EDIT_RESEARCH_GROUP.replace(':id', String(groupId))}>
                  <Edit className='mr-2 h-5 w-5' />
                  Chỉnh sửa
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-8 space-y-8'>
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
                          <span className='px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600'>
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

            {/* Extra Admin Information */}
            <Card className='border-gray-100 shadow-sm rounded-2xl overflow-hidden'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-bold text-primary flex items-center gap-2'>
                  <div className='p-1.5 bg-primary/5 rounded-lg'>
                    <Fingerprint className='h-5 w-5 text-primary' />
                  </div>
                  Thông tin hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  <div className='bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm'>
                    <div className='flex items-center gap-2 text-gray-400 mb-2'>
                      <Calendar className='h-4 w-4' />
                      <span className='text-[10px] font-black uppercase tracking-widest'>Ngày tạo</span>
                    </div>
                    <p className='text-sm font-bold text-gray-900'>{formatDateTime(group.createdAt)}</p>
                    <p className='text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight'>
                      Bởi: {group.createdBy || 'Hệ thống'}
                    </p>
                  </div>

                  <div className='bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm'>
                    <div className='flex items-center gap-2 text-gray-400 mb-2'>
                      <Clock className='h-4 w-4' />
                      <span className='text-[10px] font-black uppercase tracking-widest'>Cập nhật cuối</span>
                    </div>
                    <p className='text-sm font-bold text-gray-900'>{formatDateTime(group.modifiedAt)}</p>
                    <p className='text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight'>
                      Bởi: {group.modifiedBy || 'Hệ thống'}
                    </p>
                  </div>

                  <div className='bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm'>
                    <div className='flex items-center gap-2 text-gray-400 mb-2'>
                      {group.isPrivate ? <Lock className='h-4 w-4' /> : <Globe className='h-4 w-4' />}
                      <span className='text-[10px] font-black uppercase tracking-widest'>Chế độ bảo mật</span>
                    </div>
                    <p className='text-sm font-bold text-gray-900'>{group.isPrivate ? 'Riêng tư' : 'Công khai'}</p>
                    <Badge
                      variant='outline'
                      className={cn(
                        'mt-2 text-[9px] font-black uppercase',
                        group.isPrivate
                          ? 'border-amber-200 text-amber-600 bg-amber-50'
                          : 'border-emerald-200 text-emerald-600 bg-emerald-50'
                      )}
                    >
                      {group.isPrivate ? 'Private' : 'Public'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-4 space-y-6'>
            {pendingJoinRequests.length > 0 && (
              <Card className='border-orange-100 bg-orange-50/50 shadow-sm rounded-2xl overflow-hidden'>
                <CardHeader className='pb-3 flex flex-row items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <UserPlus className='h-5 w-5 text-primary' />
                    <CardTitle className='text-base font-bold text-slate-800'>Yêu cầu tham gia</CardTitle>
                  </div>
                  <Badge className='bg-primary text-white hover:bg-primary/90 ml-auto h-6 w-6 flex items-center justify-center p-0 rounded-full font-bold'>
                    {group.pendingRequestsCount || pendingJoinRequests.length}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {pendingJoinRequests.map((request) => (
                      <div
                        key={request.requestId}
                        className='bg-white p-3 rounded-xl border border-orange-100 shadow-sm hover:border-orange-200 transition-colors'
                      >
                        <div className='flex items-center gap-3 mb-3'>
                          <UserAvatar name={request.fullName} className='h-9 w-9 border border-gray-100' />
                          <div>
                            <div className='font-bold text-sm text-gray-900 leading-none mb-1'>{request.fullName}</div>
                            <div className='text-xs text-gray-500'>{request.username}</div>
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='flex-1 h-9 rounded-lg gap-2 text-primary font-bold border-primary/20 hover:bg-primary/5 hover:text-primary'
                            asChild
                          >
                            <Link
                              to={PATHS.ADMIN.APPROVALS.JOIN_REQUEST_DETAIL.replace(':id', String(request.requestId))}
                            >
                              <Eye className='h-4 w-4' />
                              Xem chi tiết
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    {group.pendingRequestsCount > 5 && (
                      <p className='text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2'>
                        Và {group.pendingRequestsCount - 5} yêu cầu khác...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className='border-gray-100 shadow-sm rounded-2xl overflow-hidden'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base font-bold text-gray-900'>
                  Thành viên ({studentMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-6 mt-4'>
                  <div>
                    <div className='text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4'>
                      Giảng viên hướng dẫn
                    </div>
                    <div className='space-y-3'>
                      <div className='p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4'>
                        <UserAvatar
                          name={group.leaderName || ''}
                          className='h-14 w-14 border-2 border-white shadow-md'
                        />
                        <div>
                          <div className='font-bold text-base text-[#153898] uppercase tracking-tight'>
                            {group.leaderName}
                          </div>
                          <div className='text-[12px] text-blue-500 font-bold uppercase tracking-tighter mt-1'>
                            Giảng viên hướng dẫn
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className='text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4'>
                      Thành viên
                    </div>
                    <div className='space-y-5'>
                      {studentMembers.length > 0 ? (
                        studentMembers.map((member) => (
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
                                <div className='font-bold text-base text-gray-700 group-hover:text-primary transition-colors'>
                                  {member.fullName}
                                </div>
                                <div className='flex items-center gap-2 mt-1'>
                                  <Badge
                                    variant={member.role.toLowerCase() as 'leader' | 'co_leader' | 'member'}
                                    className='text-[10px] uppercase'
                                  >
                                    {MemberRoleLabel[member.role as MemberRoleType] || member.role}
                                  </Badge>
                                  <span className='text-[10px] text-gray-400 font-medium'>{member.username}</span>
                                </div>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                                >
                                  <MoreVertical className='h-4 w-4 text-gray-400' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end' className='w-56 rounded-xl border-gray-100 p-1'>
                                {member.role === MemberRole.MEMBER ? (
                                  <DropdownMenuItem
                                    className='gap-2 font-bold text-primary cursor-pointer hover:bg-primary/5 py-2.5 rounded-lg'
                                    onClick={() => handleUpdateRole(member.username, MemberRole.CO_LEADER)}
                                    disabled={updateRoleMutation.isPending}
                                  >
                                    <Crown className='h-4 w-4' />
                                    Bổ nhiệm làm nhóm trưởng
                                  </DropdownMenuItem>
                                ) : member.role === MemberRole.CO_LEADER ? (
                                  <DropdownMenuItem
                                    className='gap-2 font-bold text-red-600 cursor-pointer hover:bg-red-50 py-2.5 rounded-lg'
                                    onClick={() => handleUpdateRole(member.username, MemberRole.MEMBER)}
                                    disabled={updateRoleMutation.isPending}
                                  >
                                    <UserMinus className='h-4 w-4' />
                                    Xóa vai trò nhóm trưởng
                                  </DropdownMenuItem>
                                ) : null}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                      ) : (
                        <div className='flex flex-col items-center justify-center py-10 text-gray-400'>
                          <Users className='h-10 w-10 mb-3 opacity-20' />
                          <p className='text-sm italic font-medium'>Chưa có thành viên trong nhóm</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminResearchGroupDetailPage
