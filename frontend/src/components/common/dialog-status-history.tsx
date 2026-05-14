import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Loader2, User, CheckCircle2, XCircle, Clock, AlertTriangle, Mail } from 'lucide-react'
import { useBookingStatusHistoryQuery } from '@/queries/booking.queries'
import { RequestStatusLabels, type RequestStatusType } from '@/constants/types'
import { cn } from '@/lib/utils'

interface DialogStatusHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: number
  title?: string
  currentStatus?: RequestStatusType
}

const getStatusIcon = (status: RequestStatusType | null) => {
  switch (status) {
    case 'APPROVED':
      return <CheckCircle2 className='h-5 w-5 text-white' />
    case 'REJECTED':
      return <XCircle className='h-5 w-5 text-white' />
    case 'CANCELED':
      return <XCircle className='h-5 w-5 text-white' />
    case 'SYSTEM_CANCELED':
      return <AlertTriangle className='h-5 w-5 text-white' />
    case 'PENDING':
    default:
      return <Clock className='h-5 w-5 text-white' />
  }
}

const getStatusColor = (status: RequestStatusType | null) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-500'
    case 'REJECTED':
      return 'bg-red-500'
    case 'CANCELED':
      return 'bg-slate-400'
    case 'SYSTEM_CANCELED':
      return 'bg-rose-500'
    case 'PENDING':
    default:
      return 'bg-amber-400'
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Vừa xong'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadgeVariant = (status: RequestStatusType): BadgeVariant => {
  const map: Record<RequestStatusType, BadgeVariant> = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELED: 'canceled',
    SYSTEM_CANCELED: 'system_canceled'
  }
  return map[status] || 'secondary'
}

export const DialogStatusHistory = ({
  open,
  onOpenChange,
  bookingId,
  title = 'Lịch sử quy trình',
  currentStatus
}: DialogStatusHistoryProps) => {
  const { data: histories, isLoading } = useBookingStatusHistoryQuery(bookingId, {
    enabled: open && !!bookingId
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-white'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50 relative'>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>{title}</DialogTitle>
              <DialogDescription className='text-sm font-medium'>
                Theo dõi các thay đổi trạng thái của yêu cầu đơn đặt phòng
              </DialogDescription>
            </div>
            {currentStatus && (
              <Badge variant={getStatusBadgeVariant(currentStatus)} className='font-bold text-xs uppercase px-3 py-1'>
                {RequestStatusLabels[currentStatus]}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className='p-6 pt-2 max-h-[500px] overflow-y-auto'>
          {isLoading ? (
            <div className='flex justify-center items-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : histories && histories.length > 0 ? (
            <div className='relative'>
              <div className='absolute left-[18px] top-6 bottom-6 w-0.5 bg-gray-200' />

              <div className='space-y-1'>
                {histories.map((history) => (
                  <div key={history.id} className='relative flex gap-4 pb-6'>
                    <div
                      className={cn(
                        'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-md',
                        getStatusColor(history.toStatus as RequestStatusType)
                      )}
                    >
                      {getStatusIcon(history.toStatus as RequestStatusType)}
                    </div>

                    <div className='flex-1 pt-0.5'>
                      <div className='flex items-start justify-between gap-2'>
                        <div>
                          <h4 className='font-bold text-gray-900 text-[15px]'>
                            {RequestStatusLabels[history.toStatus as RequestStatusType] || history.changeReason}
                          </h4>
                          {history.createdBy && (
                            <div className='flex items-center gap-1.5 mt-1 text-gray-500'>
                              <User className='h-3.5 w-3.5' />
                              <span className='text-sm font-medium'>
                                {history.createdBy.username} - {history.createdBy.fullName}
                              </span>
                            </div>
                          )}
                          <div className='flex items-center gap-1.5 mt-1.5 text-slate-500'>
                            <Mail className='h-3.5 w-3.5' />
                            <span className='text-[13px] font-medium'>{history.note || 'Không có ghi chú.'}</span>
                          </div>
                        </div>
                        <div className='text-right shrink-0'>
                          <div className='flex items-center justify-end gap-1.5 text-slate-600'>
                            <Clock className='h-3 w-3' />
                            <span className='text-xs font-bold uppercase tracking-tight'>
                              {formatTimeAgo(history.createdAt)}
                            </span>
                          </div>
                          <p className='text-[10px] text-slate-400 font-bold mt-1 tracking-wide uppercase transition-colors'>
                            {formatFullDate(history.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className='mt-2.5'></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='text-center py-12 text-gray-400'>
              <Clock className='h-12 w-12 mx-auto mb-3 opacity-50' />
              <p className='font-medium'>Chưa có lịch sử quy trình</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
