import { useNavigate, useParams } from 'react-router'
import { Loader2, Info, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useJoinRequestByIdQuery,
  useApproveJoinRequestMutation,
  useRejectJoinRequestMutation
} from '@/queries/group-join-request.queries'
import { PATHS } from '@/constants/paths'
import { RequestStatus, RequestStatusLabels } from '@/constants/types'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'
import { formatDateTime } from '@/utils/format'
import { useState } from 'react'
import { DialogReject } from '@/components/common/dialog-reject'
import { DialogApprove } from '@/components/common/dialog-approve'
import { GROUP_REJECTION_REASONS } from '@/constants/rejection-reasons'

import { LecturerLoading } from '@/components/common/lecturer-loading'

const LecturerJoinRequestDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const requestId = Number(id)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)

  const { data: requestData, isLoading: isRequestLoading } = useJoinRequestByIdQuery(requestId)
  const request = requestData?.data

  const approveMutation = useApproveJoinRequestMutation()
  const rejectMutation = useRejectJoinRequestMutation()

  const handleApprove = async (note: string) => {
    try {
      await approveMutation.mutateAsync({
        requestId,
        data: {
          responseNote: note
        }
      })
      toast.success('Đã chấp nhận yêu cầu tham gia')
      setApproveOpen(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleReject = async (reason: string) => {
    try {
      await rejectMutation.mutateAsync({
        requestId,
        data: {
          responseNote: reason
        }
      })
      toast.success('Đã từ chối yêu cầu tham gia')
      setRejectOpen(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  if (isRequestLoading) {
    return <LecturerLoading message='Đang tải thông tin đơn đăng ký...' />
  }

  if (!request) {
    return (
      <div>
        <div className='text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm'>
          <Info className='h-16 w-16 text-gray-300 mx-auto mb-4' />
          <h2 className='text-xl font-bold text-gray-900 mb-2'>Không tìm thấy dữ liệu</h2>
          <p className='text-gray-500 mb-6'>Thông tin đơn đăng ký này không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={() => navigate(PATHS.LECTURER.JOIN_REQUESTS)}>Quay lại danh sách</Button>
        </div>
      </div>
    )
  }

  const isPending = request.status === RequestStatus.PENDING

  return (
    <div>
      <div className='w-full'>
        <div className='mb-8'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-4'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => navigate(-1)}
                  className='rounded-full h-10 w-10 hover:bg-white transition-colors'
                >
                  <ChevronLeft className='h-6 w-6' />
                </Button>
                <h1 className='text-2xl font-black tracking-tight text-primary uppercase'>
                  Chi tiết đơn tham gia nhóm
                </h1>
                <Badge
                  variant={request.status.toLowerCase() as 'pending' | 'approved' | 'rejected' | 'canceled'}
                  className='font-bold h-7 px-4 rounded-full ml-2 hidden md:inline-flex'
                >
                  {RequestStatusLabels[request.status as keyof typeof RequestStatusLabels]}
                </Badge>
              </div>
              <p className='text-gray-500 font-medium ml-14'>Xem và xét duyệt đơn đăng ký tham gia nhóm nghiên cứu</p>
            </div>
          </div>
        </div>

        <Card className='border-none shadow-sm rounded-xl overflow-hidden'>
          <div className='md:hidden p-4 bg-white border-b border-gray-100'>
            <Badge
              variant={request.status.toLowerCase() as 'pending' | 'approved' | 'rejected' | 'canceled'}
              className='font-bold h-7 px-4 rounded-full w-fit'
            >
              {RequestStatusLabels[request.status as keyof typeof RequestStatusLabels]}
            </Badge>
          </div>

          <CardContent className='p-6 space-y-8'>
            <section className='space-y-6'>
              <div className='flex items-center gap-2 text-primary pb-2 border-b border-gray-100 mb-6'>
                <span className='font-black text-lg uppercase'>1. THÔNG TIN NGƯỜI ĐĂNG KÍ</span>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                <div className='space-y-2'>
                  <Label className='text-md font-semibold text-gray-700'>Họ và tên</Label>
                  <Input
                    value={request.user.fullName}
                    readOnly
                    className='h-11 bg-white border-gray-200 rounded-xl focus:ring-primary/20 transition-all cursor-default'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-md font-semibold text-gray-700'>Mã số sinh viên</Label>
                  <Input
                    value={request.user.username}
                    readOnly
                    className='h-11 bg-white border-gray-200 rounded-xl focus:ring-primary/20 transition-all cursor-default'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-md font-semibold text-gray-700'>Email</Label>
                  <Input
                    value={request.user.iuhEmail}
                    readOnly
                    className='h-11 bg-white border-gray-200 rounded-xl focus:ring-primary/20 transition-all cursor-default'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-md font-semibold text-gray-700'>Khoa / Viện</Label>
                  <Input
                    value={request.user.faculty || '—'}
                    readOnly
                    className='h-11 bg-white border-gray-200 rounded-xl focus:ring-primary/20 transition-all cursor-default'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-md font-semibold text-gray-700'>Ngành học</Label>
                  <Input
                    value={request.user.department || '—'}
                    readOnly
                    className='h-11 bg-white border-gray-200 rounded-xl focus:ring-primary/20 transition-all cursor-default'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-md font-semibold text-gray-700'>Lớp danh nghĩa</Label>
                  <Input
                    value={request.user.grade || '—'}
                    readOnly
                    className='h-11 bg-white border-gray-200 rounded-xl focus:ring-primary/20 transition-all cursor-default'
                  />
                </div>
              </div>
            </section>

            <section className='space-y-6'>
              <div className='flex items-center gap-2 text-primary pb-2 border-b border-gray-100 mb-6'>
                <span className='font-black text-lg uppercase'>2. THÔNG TIN NHÓM ĐĂNG KÍ</span>
              </div>
              <div className='grid gap-8'>
                <div className='space-y-2'>
                  <Label className='text-md font-semibold text-gray-700'>Tên nhóm</Label>
                  <Input
                    value={request.groupName}
                    readOnly
                    className='h-11 bg-white border-gray-200 rounded-xl focus:ring-primary/20 transition-all cursor-default'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-md font-semibold text-gray-700'>Tên đề tài</Label>
                  <Input
                    value={request.projectName || (request.groupName === 'N/A' ? '—' : 'Chưa có đề tài')}
                    readOnly
                    className='h-11 bg-white border-gray-200 rounded-xl focus:ring-primary/20 transition-all cursor-default'
                  />
                </div>
                <div className='flex flex-col gap-8'>
                  <div className='space-y-2'>
                    <Label className='text-md font-semibold text-gray-700'>Lời nhắn từ sinh viên</Label>
                    <div className='bg-blue-50/30 p-5 rounded-xl border border-blue-100 text-gray-700 min-h-[100px] shadow-inner whitespace-pre-wrap italic font-medium'>
                      &quot;{request.message || 'Không có lời nhắn.'}&quot;
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {!isPending && (
              <section className='space-y-6 pt-6 border-t border-gray-100'>
                <div className='flex items-center gap-2 text-primary pb-2 border-b border-gray-100 mb-6'>
                  <span className='font-black text-lg uppercase'>
                    3. {request.status === RequestStatus.APPROVED ? 'Thông tin phê duyệt' : 'Thông tin từ chối'}
                  </span>
                </div>

                <div className='space-y-4'>
                  <Label className='text-md font-semibold text-gray-700'>
                    {request.status === RequestStatus.APPROVED ? 'Ghi chú phê duyệt:' : 'Lý do từ chối:'}
                  </Label>
                  <div className='p-6 bg-gray-50 rounded-xl min-h-[100px] whitespace-pre-wrap transition-all cursor-default text-gray-700 font-medium text-lg border border-gray-100'>
                    {request.responseNote || 'Không có ghi chú.'}
                  </div>
                </div>

                <div className='pt-4 flex items-center gap-2 text-sm font-semibold text-gray-500 italic justify-end'>
                  <span>Được xử lý bởi</span>
                  <span className='underline underline-offset-2 capitalize text-gray-700 font-bold'>
                    {request.responseBy?.fullName}
                  </span>
                  <span>vào lúc</span>
                  <span className='text-gray-700 font-bold'>{formatDateTime(request.responseDate)}</span>
                </div>
              </section>
            )}

            <div className='flex justify-end gap-3 pt-4'>
              {isPending && (
                <>
                  <Button
                    variant='approve'
                    onClick={() => setApproveOpen(true)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className='px-10 h-11'
                  >
                    {approveMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Duyệt'}
                  </Button>
                  <Button
                    variant='reject'
                    onClick={() => setRejectOpen(true)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className='px-10 h-11'
                  >
                    {rejectMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Từ chối'}
                  </Button>
                </>
              )}
              <Button variant='cancel' onClick={() => navigate(PATHS.LECTURER.JOIN_REQUESTS)} className='px-10 h-11'>
                Đóng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogReject
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
        title='Xác nhận Từ Chối Yêu cầu tham gia'
        description='Vui lòng chọn hoặc nhập lý do từ chối yêu cầu tham gia của sinh viên này.'
        reasons={GROUP_REJECTION_REASONS}
        isLoading={rejectMutation.isPending}
      />

      <DialogApprove
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={handleApprove}
        title='Phê duyệt Yêu cầu tham gia'
        isLoading={approveMutation.isPending}
      />
    </div>
  )
}

export default LecturerJoinRequestDetailPage
