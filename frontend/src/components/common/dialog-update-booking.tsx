import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Users, Laptop, AlertCircle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'
import type { BookingResponse, SecureBookingResponse, UpdateBookingRequest } from '@/schemas/booking.schema'
import { useUpdateBookingMutation } from '@/queries/booking.queries'
import { useDeviceAvailabilityQuery } from '@/queries/device.queries'
import { useGroupMembersQuery } from '@/queries/research-group.queries'
import { cn } from '@/lib/utils'
import { DuplicateConfirmDialog } from '@/components/common/duplicate-confirm-dialog'
import { useBookingParticipantUsernamesQuery } from '@/queries/booking.queries'

interface Props {
  booking: (BookingResponse | SecureBookingResponse) | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isLecturerView?: boolean
}

export const DialogUpdateBooking = ({ booking, open, onOpenChange, isLecturerView }: Props) => {
  const [purpose, setPurpose] = useState('')
  const [deviceQuantities, setDeviceQuantities] = useState<Record<number, number>>({})
  const [selectedParticipantUsernames, setSelectedParticipantUsernames] = useState<string[]>([])
  const [conflictingUsers, setConflictingUsers] = useState<string[]>([])
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)

  const updateBookingMutation = useUpdateBookingMutation()

  const slotIds = booking?.slots.map((s) => s.slotId) || []
  const researchGroupId = booking?.researchGroupIds?.[0]

  const { data: devicesAvailabilityRes, isLoading: isLoadingDevices } = useDeviceAvailabilityQuery(
    {
      labRoomId: booking?.labRoomId || 0,
      date: booking?.bookingDate || '',
      slotIds: slotIds,
      excludeBookingId: booking?.bookingRequestId
    },
    { enabled: !!booking && open }
  )
  const availableDevices = devicesAvailabilityRes?.data || []

  const { data: members, isLoading: isLoadingMembers } = useGroupMembersQuery(
    researchGroupId || 0,
    !!researchGroupId && (isLecturerView || booking?.bookingType === 'GROUP') && open
  )

  const [prevBookingId, setPrevBookingId] = useState<number | null>(null)
  if (open && booking && booking.bookingRequestId !== prevBookingId) {
    setPrevBookingId(booking.bookingRequestId)
    setPurpose(booking.purpose)
    const devs: Record<number, number> = {}
    booking.devices?.forEach((d) => {
      devs[d.deviceId] = d.quantity
    })
    setDeviceQuantities(devs)
  }

  const { data: currentParticipants = [] } = useBookingParticipantUsernamesQuery(booking?.bookingRequestId || 0, {
    enabled: !!booking && open && (isLecturerView || booking?.bookingType === 'GROUP')
  })

  const [prevParticipants, setPrevParticipants] = useState<string[]>([])
  if (currentParticipants && currentParticipants.length > 0 && currentParticipants !== prevParticipants) {
    setPrevParticipants(currentParticipants)
    setSelectedParticipantUsernames(currentParticipants)
  }

  const handleSave = async (force: boolean = false) => {
    if (!booking) return
    if (!purpose.trim()) {
      toast.error('Vui lòng nhập mục đích sử dụng')
      return
    }

    if (booking.bookingType === 'GROUP' && selectedParticipantUsernames.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 thành viên tham gia')
      return
    }

    try {
      const devices = Object.entries(deviceQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({
          deviceId: Number(id),
          quantity: qty
        }))

      const participants = selectedParticipantUsernames.map((username) => ({
        username,
        role: 'GROUP_STUDY' as const
      }))

      const data: UpdateBookingRequest = {
        purpose,
        participants: booking.bookingType === 'GROUP' ? participants : [],
        devices,
        force
      }

      await updateBookingMutation.mutateAsync({ id: booking.bookingRequestId, data })
      toast.success('Cập nhật yêu cầu thành công')
      onOpenChange(false)
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response: { data: { code: number; data: string[] } } }
        if (err.response?.data?.code === 2616) {
          setConflictingUsers(err.response.data.data)
          setShowDuplicateDialog(true)
          return
        }
      }
      handleErrorApi({ error })
    }
  }

  if (!booking) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-w-4xl max-h-[90vh] overflow-y-auto rounded-xl'>
          <DialogHeader>
            <DialogTitle
              className={cn(
                'text-2xl font-bold text-[#153898] flex items-center gap-2',
                !isLecturerView && 'uppercase'
              )}
            >
              {isLecturerView && <ShieldCheck className='h-7 w-7' />}
              {isLecturerView ? 'CẬP NHẬT ĐẶT PHÒNG NHÓM' : 'Cập nhật yêu cầu đặt phòng'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-8 py-4'>
            {/* Mục đích */}
            <div className='space-y-3'>
              <Label className='text-md font-bold text-gray-700 flex items-center gap-2'>
                <AlertCircle className='h-5 w-5 text-[#153898]' />
                Mục đích sử dụng <span className='text-red-500'>*</span>
              </Label>
              <Textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder='Nhập mục đích sử dụng...'
                className='min-h-[100px] border-gray-200 focus:border-[#153898]'
              />
            </div>

            {/* Thành viên (GROUP) */}
            {(isLecturerView || booking.bookingType === 'GROUP') && (
              <div className='space-y-3'>
                <Label className='text-md font-bold text-gray-700 flex items-center gap-2'>
                  <Users className='h-5 w-5 text-[#153898]' />
                  {isLecturerView ? 'Chỉnh sửa thành viên tham gia' : 'Thành viên tham gia'}{' '}
                  <span className='text-red-500'>*</span>
                </Label>
                <div className='border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
                  <table className='w-full text-sm text-left'>
                    <thead className='bg-gray-50 border-b'>
                      <tr>
                        <th className='p-4 w-10'>
                          <Checkbox
                            checked={
                              members && members.length > 0 && selectedParticipantUsernames.length === members.length
                            }
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedParticipantUsernames(members?.map((m) => m.username) || [])
                              else setSelectedParticipantUsernames([])
                            }}
                          />
                        </th>
                        <th className='px-6 py-3 font-bold text-[#153898]'>{isLecturerView ? 'Mã số' : 'MSSV'}</th>
                        <th className='px-6 py-3 font-bold text-[#153898]'>Họ tên</th>
                        <th className='px-6 py-3 font-bold text-[#153898]'>Vai trò</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y'>
                      {isLoadingMembers ? (
                        <tr>
                          <td colSpan={4} className='px-6 py-8 text-center'>
                            <Loader2 className='h-6 w-6 animate-spin mx-auto text-[#153898]' />
                          </td>
                        </tr>
                      ) : members && members.length > 0 ? (
                        members.map((m) => (
                          <tr key={m.username} className='hover:bg-gray-50'>
                            <td className='p-4'>
                              <Checkbox
                                checked={selectedParticipantUsernames.includes(m.username)}
                                onCheckedChange={(checked) => {
                                  if (checked) setSelectedParticipantUsernames((prev) => [...prev, m.username])
                                  else setSelectedParticipantUsernames((prev) => prev.filter((u) => u !== m.username))
                                }}
                              />
                            </td>
                            <td className='px-6 py-4 font-mono font-bold text-gray-700'>{m.username}</td>
                            <td className='px-6 py-4 text-gray-800'>{m.fullName}</td>
                            <td className='px-6 py-4'>
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                                  m.role === 'LEADER'
                                    ? 'bg-amber-100 text-amber-700'
                                    : m.role === 'CO_LEADER'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-600'
                                )}
                              >
                                {m.role === 'LEADER' ? 'GVHD' : m.role === 'CO_LEADER' ? 'Trưởng nhóm' : 'Thành viên'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className='px-6 py-10 text-center text-gray-400 italic'>
                            {researchGroupId
                              ? `Không tìm thấy thành viên nào cho nhóm (ID: ${researchGroupId}).`
                              : 'Không xác định được nhóm nghiên cứu cho đơn đăng ký này.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Thiết bị */}
            <div className='space-y-3'>
              <Label className='text-md font-bold text-gray-700 flex items-center gap-2'>
                <Laptop className='h-5 w-5 text-[#153898]' />
                {isLecturerView ? 'Chỉnh sửa thiết bị sử dụng' : 'Đăng ký thiết bị sử dụng'}
              </Label>
              <div className='border border-gray-100 rounded-xl overflow-hidden shadow-sm'>
                <table className='w-full text-sm text-left'>
                  <thead className='bg-gray-50 border-b'>
                    <tr>
                      <th className='px-6 py-3 font-bold text-[#153898]'>Tên thiết bị</th>
                      <th className='px-6 py-3 text-center font-bold text-[#153898]'>Hiện có</th>
                      <th className='px-6 py-3 text-center w-32 font-bold text-[#153898]'>Số lượng</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {isLoadingDevices ? (
                      <tr>
                        <td colSpan={3} className='px-6 py-8 text-center'>
                          <Loader2 className='h-6 w-6 animate-spin mx-auto text-[#153898]' />
                        </td>
                      </tr>
                    ) : availableDevices.length > 0 ? (
                      availableDevices.map((item) => (
                        <tr key={item.deviceId} className='hover:bg-gray-50/50'>
                          <td className='px-6 py-4'>
                            <div className='font-semibold text-gray-900'>{item.deviceName}</div>
                            <div className='text-[10px] text-gray-400 uppercase font-black'>{item.deviceType}</div>
                          </td>
                          <td className='px-6 py-4 text-center font-mono font-bold text-gray-600'>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded',
                                item.availableQuantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                              )}
                            >
                              {item.availableQuantity}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <Input
                              type='number'
                              min={0}
                              max={item.availableQuantity}
                              value={deviceQuantities[item.deviceId] || ''}
                              onChange={(e) =>
                                setDeviceQuantities((prev) => ({
                                  ...prev,
                                  [item.deviceId]: Number(e.target.value)
                                }))
                              }
                              className='h-9 text-center font-bold'
                              placeholder='0'
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className='px-6 py-8 text-center text-gray-400 italic'>
                          Không có thiết bị khả dụng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0 pt-6 border-t mt-4'>
            <Button variant='ghost' onClick={() => onOpenChange(false)} className='font-bold text-gray-500 h-11'>
              Hủy bỏ
            </Button>
            <Button
              className='bg-[#153898] hover:bg-blue-800 text-white font-bold h-11 px-8 shadow-lg shadow-blue-200'
              onClick={() => handleSave(false)}
              disabled={updateBookingMutation.isPending}
            >
              {updateBookingMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ĐANG LƯU...
                </>
              ) : (
                'XÁC NHẬN CẬP NHẬT'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showDuplicateDialog && (
        <DuplicateConfirmDialog
          open={showDuplicateDialog}
          onOpenChange={setShowDuplicateDialog}
          onConfirm={() => handleSave(true)}
          conflictingUsers={conflictingUsers}
        />
      )}
    </>
  )
}
