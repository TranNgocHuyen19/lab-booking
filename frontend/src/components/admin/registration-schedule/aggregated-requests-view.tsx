import { Box, CheckCircle, Layers, User, Users, XCircle } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookingType, BookingTypeLabels } from '@/constants/types'
import type { SlotBookingDetailItem } from '@/schemas/booking.schema'
import { deviceIconMap } from '@/utils/icon'

interface AggregatedRequestsViewProps {
  title: string
  requests: SlotBookingDetailItem[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onBulkApprove?: (ids: number[]) => void
  isApprovedMode?: boolean
}

export const AggregatedRequestsView = ({
  title,
  requests,
  onApprove,
  onReject,
  onBulkApprove,
  isApprovedMode = false
}: AggregatedRequestsViewProps) => {
  return (
    <div className='flex flex-col h-full'>
      <div className='px-8 py-6 border-b border-gray-100 bg-white shadow-sm shrink-0'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='p-2 rounded-lg bg-gray-100 text-gray-600'>
            <Layers size={24} />
          </div>
          <div>
            <h2 className='text-xl font-bold text-gray-800'>{title}</h2>
            <p className='text-sm text-gray-500'>Danh sách chi tiết ({requests.length} mục)</p>
          </div>
        </div>
        {!isApprovedMode && (
          <div className='mt-4 flex gap-3'>
            <Button
              variant='approve'
              onClick={() => {
                if (onBulkApprove) {
                  onBulkApprove(requests.map((r) => r.bookingRequestId))
                } else {
                  requests.forEach((r) => onApprove(r.bookingRequestId))
                }
              }}
            >
              <CheckCircle size={16} className='mr-2' /> Duyệt tất cả
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className='flex-1 p-8 bg-gray-50/30'>
        <div className='grid grid-cols-1 gap-4 w-full'>
          {requests.map((req) => (
            <div
              key={req.bookingRequestId}
              className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4'
            >
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <Badge
                    variant={
                      (req.bookingType === BookingType.GROUP
                        ? 'research'
                        : req.bookingType.toLowerCase()) as BadgeVariant
                    }
                    className='text-xs'
                  >
                    {BookingTypeLabels[req.bookingType as keyof typeof BookingTypeLabels] || req.bookingType}
                  </Badge>
                </div>
                <h4 className='font-bold text-gray-800 text-sm'>{req.groupName || req.purpose}</h4>
                <div className='text-xs text-gray-500 mt-1 flex flex-col gap-2'>
                  <div className='flex items-center gap-3'>
                    <span className='flex items-center gap-1'>
                      <User size={12} /> {req.requesterName} {req.requesterUsername && `(${req.requesterUsername})`}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Users size={12} /> {req.participantCount} người
                    </span>
                  </div>

                  {req.devices && req.devices.length > 0 && (
                    <div className='flex flex-wrap gap-2 mt-1'>
                      {req.devices.map((device) => {
                        const IconComponent = deviceIconMap[device.icon as keyof typeof deviceIconMap] || Box
                        return (
                          <div
                            key={device.deviceId}
                            className='flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-600'
                          >
                            <IconComponent size={10} className='text-primary' />
                            {device.deviceName} (x{device.quantity})
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
              {!isApprovedMode && (
                <div className='flex items-center gap-2 shrink-0'>
                  <Button
                    size='icon'
                    variant='reject'
                    className='h-8 w-8'
                    onClick={() => onReject(req.bookingRequestId)}
                  >
                    <XCircle size={16} />
                  </Button>
                  <Button
                    size='icon'
                    variant='approve'
                    className='h-8 w-8'
                    onClick={() => onApprove(req.bookingRequestId)}
                  >
                    <CheckCircle size={16} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
