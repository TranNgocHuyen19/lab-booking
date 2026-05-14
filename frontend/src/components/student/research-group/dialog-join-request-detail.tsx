import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useJoinRequestByIdQuery } from '@/queries/group-join-request.queries'
import type { GroupJoinRequestResponse } from '@/schemas/research-group.schema'
import { MemberRole } from '@/constants/types'
import { formatDateTime } from '@/utils/format'
import {
  Building2,
  FileText,
  GraduationCap,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User
} from 'lucide-react'

interface DialogJoinRequestDetailProps {
  request: GroupJoinRequestResponse | null
  onClose: () => void
  onApprove: (id: number) => void
  onReject: (id: number) => void
  isProcessing: boolean
  memberRole?: string | null
}

const DialogJoinRequestDetail = ({
  request,
  onClose,
  onApprove,
  onReject,
  isProcessing,
  memberRole
}: DialogJoinRequestDetailProps) => {
  const { data: requestDetail, isLoading: isDetailLoading } = useJoinRequestByIdQuery(request?.requestId || 0)
  const applicant = requestDetail?.data?.user

  if (!request) return null

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-[650px] border-none shadow-2xl rounded-xl overflow-hidden p-0'>
        <div className='bg-[#153898] h-28 w-full relative overflow-hidden flex items-center px-10'>
          <div
            className='absolute inset-0 opacity-10'
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
          <div className='relative z-10 flex items-center gap-5 text-white'>
            <div className='p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20'>
              <FileText className='h-7 w-7 text-white' />
            </div>
            <div>
              <DialogTitle className='text-xl font-black tracking-tight uppercase'>Hồ sơ đăng ký tham gia</DialogTitle>
              <DialogDescription className='text-blue-100/70 font-bold text-xs'>
                Chi tiết lý lịch và nguyện vọng của sinh viên
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className='p-8 space-y-8 max-h-[70vh] overflow-y-auto bg-white custom-scrollbar'>
          {isDetailLoading ? (
            <div className='flex flex-col items-center justify-center py-20 gap-4'>
              <Loader2 className='h-12 w-12 text-primary animate-spin' />
              <p className='text-slate-400 font-black animate-pulse uppercase tracking-widest text-[10px]'>
                Đang tải hồ sơ sinh viên...
              </p>
            </div>
          ) : (
            <div className='space-y-8'>
              <div className='space-y-6'>
                <h3 className='text-primary text-lg font-black uppercase tracking-tight flex items-center gap-3'>
                  <User className='h-5 w-5' />
                  Thông tin cá nhân
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                  <div className='space-y-2'>
                    <label className='text-xs font-bold text-gray-700 block flex items-center gap-2'>
                      <User className='h-4 w-4 text-primary/60' /> Họ và tên
                    </label>
                    <Input
                      value={applicant?.fullName || request.fullName}
                      readOnly
                      className='h-10 bg-gray-50/50 cursor-default border-gray-200 focus-visible:ring-0 font-bold text-gray-700 text-sm'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-xs font-bold text-gray-700 block flex items-center gap-2'>
                      <IdCard className='h-4 w-4 text-primary/60' /> Mã số sinh viên
                    </label>
                    <Input
                      value={request.username}
                      readOnly
                      className='h-10 bg-gray-50/50 cursor-default border-gray-200 focus-visible:ring-0 font-bold text-gray-700 uppercase text-sm'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                  <div className='space-y-2'>
                    <label className='text-xs font-bold text-gray-700 block flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-primary/60' /> Email Nhà trường
                    </label>
                    <Input
                      value={applicant?.iuhEmail || 'N/A'}
                      readOnly
                      className='h-10 bg-gray-50/50 cursor-default border-gray-200 focus-visible:ring-0 font-medium text-gray-500 text-sm'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-xs font-bold text-gray-700 block flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-primary/60' /> Số điện thoại
                    </label>
                    <Input
                      value={applicant?.phone || 'Chưa cập nhật'}
                      readOnly
                      className='h-10 bg-gray-50/50 cursor-default border-gray-200 focus-visible:ring-0 font-medium text-gray-500 text-sm'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                  <div className='space-y-2'>
                    <label className='text-xs font-bold text-gray-700 block flex items-center gap-2'>
                      <Building2 className='h-4 w-4 text-primary/60' /> Khoa
                    </label>
                    <Input
                      value={applicant?.faculty || 'N/A'}
                      readOnly
                      className='h-10 bg-gray-50/50 cursor-default border-gray-200 focus-visible:ring-0 font-medium text-gray-500 text-sm'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-xs font-bold text-gray-700 block flex items-center gap-2'>
                      <MapPin className='h-4 w-4 text-primary/60' /> Ngành
                    </label>
                    <Input
                      value={applicant?.department || 'N/A'}
                      readOnly
                      className='h-10 bg-gray-50/50 cursor-default border-gray-200 focus-visible:ring-0 font-medium text-gray-500 text-sm'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-xs font-bold text-gray-700 block flex items-center gap-2'>
                      <GraduationCap className='h-4 w-4 text-primary/60' /> Lớp
                    </label>
                    <Input
                      value={applicant?.grade || 'N/A'}
                      readOnly
                      className='h-10 bg-gray-50/50 cursor-default border-gray-200 focus-visible:ring-0 font-bold text-primary text-sm'
                    />
                  </div>
                </div>
              </div>

              <Separator className='bg-gray-100' />

              <div className='space-y-4'>
                <h3 className='text-primary text-lg font-black uppercase tracking-tight flex items-center gap-3'>
                  <MessageSquare className='h-5 w-5' />
                  Nguyện vọng
                </h3>
                <div className='bg-gray-50 border border-gray-100 p-5 rounded-xl relative'>
                  <p className='text-gray-700 font-medium leading-relaxed italic text-sm'>
                    {requestDetail?.data?.message || request.message || 'Sinh viên này không để lại lời nhắn.'}
                  </p>
                  <div className='flex justify-end mt-4'>
                    <span className='px-3 py-1 bg-white text-[9px] font-black text-gray-400 border border-gray-100 rounded-full uppercase tracking-widest'>
                      Gửi lúc: {formatDateTime(requestDetail?.data?.createdAt || request.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between'>
          <Button
            variant='ghost'
            className='font-black text-gray-500 hover:bg-gray-200 rounded-xl px-10 h-14 w-full sm:w-auto uppercase tracking-wider text-xs'
            onClick={onClose}
          >
            Đóng hồ sơ
          </Button>
          <div className='flex gap-3 w-full sm:w-auto'>
            <Button
              variant='approve'
              className='px-10 h-11 flex-1 sm:flex-none text-xs'
              onClick={() => onApprove(request.requestId)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Duyệt'}
            </Button>
            {memberRole === MemberRole.LEADER && (
              <Button
                variant='reject'
                className='px-8 h-11 flex-1 sm:flex-none text-xs'
                onClick={() => onReject(request.requestId)}
                disabled={isProcessing}
              >
                Từ chối
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DialogJoinRequestDetail
