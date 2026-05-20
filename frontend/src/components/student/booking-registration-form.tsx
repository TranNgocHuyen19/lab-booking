import { useState } from 'react'
import { Users, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'
import { useGroupMembersQuery } from '@/queries/research-group.queries'
import { useCreateBookingMutation } from '@/queries/booking.queries'
import { useDeviceAvailabilityQuery } from '@/queries/device.queries'
import { formatTime } from '@/utils/format'
import { sortParticipantsByRole } from '@/utils/participant'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QUERY_KEYS } from '@/query-core'
import { DuplicateConfirmDialog } from '@/components/common/duplicate-confirm-dialog'
import type { CreateBookingRequest } from '@/schemas/booking.schema'
import type { SlotResponse } from '@/schemas/slot.schema'
import type { UserResponse } from '@/schemas/user.schema'
import type { ResearchGroupResponse, MemberInfoResponse } from '@/schemas/research-group.schema'
import { handleBookingCreateError, showBookingCreateFeedback, getScheduleConflictDetails } from '@/utils/booking-create-feedback'
import type { BookingCreateWarningDialog } from '@/utils/booking-create-feedback'

interface StudentBookingFormProps {
  selection: { roomId: number; date: string; slotIds: number[] }
  currentUser: UserResponse | null
  joinedGroups: ResearchGroupResponse[]
  slots: SlotResponse[]
  currentRoomName: string
  onCancel: () => void
  onSuccess: () => void
}

export const StudentBookingForm = ({
  selection,
  currentUser,
  joinedGroups,
  slots,
  currentRoomName,
  onCancel,
  onSuccess
}: StudentBookingFormProps) => {
  const queryClient = useQueryClient()
  const [bookingType, setBookingType] = useState<'individual' | 'group'>('individual')
  const [selectedGroup, setSelectedGroup] = useState<string>('')

  const [selectedParticipantUsernames, setSelectedParticipantUsernames] = useState<string[]>([])
  const [purpose, setPurpose] = useState<string>('')
  const [deviceQuantities, setDeviceQuantities] = useState<Record<number, number>>({})
  const [showMembersTable, setShowMembersTable] = useState(false)
  const [warningDialog, setWarningDialog] = useState<BookingCreateWarningDialog | null>(null)

  const finishBookingCreation = () => {
    setWarningDialog(null)
    onSuccess()
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT })
  }

  const { data: members, isLoading: isLoadingMembers } = useGroupMembersQuery(
    Number(selectedGroup),
    bookingType === 'group' && !!selectedGroup
  )

  const { data: devicesAvailabilityRes, isLoading: isLoadingDevicesAvailability } = useDeviceAvailabilityQuery({
    labRoomId: selection.roomId,
    date: selection.date,
    slotIds: selection.slotIds
  })
  const availableDevices = devicesAvailabilityRes?.data || []

  const createBookingMutation = useCreateBookingMutation()

  const [prevMembers, setPrevMembers] = useState<typeof members>([])
  if (members && members.length > 0 && members !== prevMembers) {
    setPrevMembers(members)
    setSelectedParticipantUsernames(members.map((m) => m.username))
  }

  const handleQuantityChange = (deviceId: number, quantity: number) => {
    setDeviceQuantities((prev) => ({
      ...prev,
      [deviceId]: quantity
    }))
  }

  const handleSaveBooking = async (forceSwitch?: boolean) => {
    if (!purpose.trim()) {
      toast.error('Vui lòng nhập mục đích sử dụng')
      return
    }

    if (bookingType === 'group') {
      if (!selectedGroup) {
        toast.error('Vui lòng chọn nhóm nghiên cứu')
        return
      }
      if (selectedParticipantUsernames.length === 0) {
        toast.error('Vui lòng chọn ít nhất 1 thành viên tham gia')
        return
      }
    }

    try {
      const devices = Object.entries(deviceQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({
          deviceId: Number(id),
          quantity: qty
        }))

      const participants = members
        ?.filter((m) => selectedParticipantUsernames.includes(m.username))
        .map((m) => ({
          userId: m.userId,
          role: 'GROUP_STUDY' as const
        }))

      const payload: CreateBookingRequest = {
        labRoomId: selection.roomId,
        slots: selection.slotIds.map((slotId) => ({
          slotId,
          bookingDate: selection.date
        })),
        bookingType: bookingType === 'group' ? 'GROUP' : 'PERSONAL',
        purpose,
        participants: bookingType === 'group' ? participants : [],
        researchGroupIds: bookingType === 'group' ? [Number(selectedGroup)] : [],
        devices,
        forceSwitch
      }

      const response = await createBookingMutation.mutateAsync(payload)
      const dialog = showBookingCreateFeedback(response)
      if (dialog) {
        setWarningDialog(dialog)
        return
      }
      finishBookingCreation()
    } catch (error: unknown) {
      const conflictDialog = getScheduleConflictDetails(error);
      if (conflictDialog) {
        setWarningDialog({
          ...conflictDialog,
          onConfirm: () => handleSaveBooking(true)
        });
        return;
      }
      handleBookingCreateError(error);
    }
  }

  return (
    <>
      <div className='animate-in fade-in slide-in-from-top-4 duration-500'>
        <div className='w-full bg-white rounded-xl border border-slate-200 p-4 shadow-sm'>
          <div className='flex items-center gap-2 mb-4 border-b border-slate-100 pb-2'>
            <div className='bg-primary/10 p-1.5 rounded-lg text-primary'>
              <CheckCircle2 className='h-5 w-5' />
            </div>
            <h2 className='text-[14px] font-bold text-gray-500 uppercase tracking-tight'>
              THÔNG TIN ĐĂNG KÝ PHÒNG LAB
            </h2>
          </div>

          <div className='grid grid-cols-1 gap-y-4'>
            <div className='space-y-1'>
              <Label className='text-[14px] font-bold text-gray-500 uppercase tracking-wider'>
                Nhóm nghiên cứu / GVHD
              </Label>
              <InfiniteScrollSelect
                value={selectedGroup}
                onValueChange={setSelectedGroup}
                placeholder='-- Chọn nhóm nghiên cứu (Nếu có) --'
                items={joinedGroups}
                getItemValue={(group: ResearchGroupResponse) => group.researchGroupId.toString()}
                getItemLabel={(group: ResearchGroupResponse) => `${group.groupName} - ${group.leaderName}`}
                icon={<Users className='h-3.5 w-3.5' />}
              />
            </div>

            <div className='space-y-1'>
              <Label className='text-[14px] font-bold text-gray-500 uppercase block'>
                HÌNH THỨC ĐĂNG KÝ <span className='text-red-500 font-bold'>*</span>
              </Label>
              <RadioGroup
                value={bookingType}
                onValueChange={(val: 'individual' | 'group') => {
                  setBookingType(val)
                  if (val === 'individual') {
                    setSelectedGroup('')
                    setSelectedParticipantUsernames([])
                  }
                }}
                className='flex gap-2'
              >
                <div className='flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex-1 h-10'>
                  <RadioGroupItem value='individual' id='individual' />
                  <Label
                    htmlFor='individual'
                    className='font-bold text-xs cursor-pointer text-gray-700 whitespace-nowrap'
                  >
                    Đăng ký cá nhân
                  </Label>
                </div>
                <div className='flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex-1 h-10'>
                  <RadioGroupItem value='group' id='group' />
                  <Label htmlFor='group' className='font-bold text-xs cursor-pointer text-gray-700 whitespace-nowrap'>
                    Đăng ký nhóm
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {bookingType === 'group' && selectedGroup && (
              <div className='space-y-2 animate-in fade-in slide-in-from-top-2'>
                <div className='flex items-center justify-between mb-1'>
                  <h3 className='text-[14px] font-bold text-gray-500 uppercase flex items-center gap-2'>
                    THÀNH VIÊN THAM GIA ({selectedParticipantUsernames.length})
                  </h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 px-3 text-[11px] font-bold text-primary hover:bg-primary/5'
                    onClick={() => setShowMembersTable(!showMembersTable)}
                  >
                    {showMembersTable ? 'ẨN DANH SÁCH >>' : 'HIỆN DANH SÁCH >>'}
                  </Button>
                </div>

                {showMembersTable && (
                  <div className='bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm'>
                    <div className='max-h-[200px] overflow-y-auto'>
                      <table className='w-full text-sm text-left text-gray-500'>
                        <thead className='text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10'>
                          <tr>
                            <th className='px-4 py-2 w-10' scope='col'>
                              <Checkbox
                                id='checkbox-all'
                                checked={
                                  members &&
                                  members.length > 0 &&
                                  selectedParticipantUsernames.length === members.length
                                }
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedParticipantUsernames(members?.map((m) => m.username) || [])
                                  } else {
                                    setSelectedParticipantUsernames([])
                                  }
                                }}
                              />
                            </th>
                            <th className='px-6 py-2 font-bold text-primary' scope='col'>
                              Mã số
                            </th>
                            <th className='px-6 py-2 font-bold text-primary' scope='col'>
                              Họ tên
                            </th>
                            <th className='px-6 py-2 font-bold text-primary' scope='col'>
                              Vai trò
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                          {isLoadingMembers ? (
                            <tr>
                              <td colSpan={4} className='px-6 py-2 text-center'>
                                <div className='flex items-center justify-center gap-2'>
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                  <span>Đang tải thành viên...</span>
                                </div>
                              </td>
                            </tr>
                          ) : members && members.length > 0 ? (
                            sortParticipantsByRole(members, currentUser?.username).map((m: MemberInfoResponse) => (
                              <tr key={m.username} className='bg-white border-b hover:bg-gray-50 transition-colors'>
                                <td className='w-4 p-4'>
                                  <Checkbox
                                    id={`checkbox-${m.username}`}
                                    checked={selectedParticipantUsernames.includes(m.username)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedParticipantUsernames((prev) => [...prev, m.username])
                                      } else {
                                        setSelectedParticipantUsernames((prev) => prev.filter((u) => u !== m.username))
                                      }
                                    }}
                                  />
                                </td>
                                <td className='px-6 py-2 font-medium text-gray-900 whitespace-nowrap'>{m.username}</td>
                                <td className='px-6 py-2 text-gray-800'>
                                  {m.fullName} {m.username === currentUser?.username && '(Bạn)'}
                                </td>
                                <td className='px-6 py-2'>
                                  <span
                                    className={cn(
                                      'px-2 py-1 rounded text-[10px] font-bold uppercase',
                                      m.role === 'LEADER'
                                        ? 'bg-amber-100 text-amber-700'
                                        : m.role === 'CO_LEADER'
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-gray-100 text-gray-600'
                                    )}
                                  >
                                    {m.role === 'LEADER'
                                      ? 'GVHD'
                                      : m.role === 'CO_LEADER'
                                        ? 'Trưởng nhóm'
                                        : 'Thành viên'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className='px-6 py-8 text-center text-gray-400 italic'>
                                Không tìm thấy thành viên
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <h3 className='text-[14px] font-bold text-gray-500 mb-2 uppercase'>PHÒNG & THỜI GIAN</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 mb-2 px-4'>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-bold text-gray-500 uppercase'>Phòng Lab</Label>
                  <div className='font-bold text-primary'>{currentRoomName || '...'}</div>
                </div>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-bold text-gray-500 uppercase'>Ngày sử dụng</Label>
                  <div className='font-bold text-gray-700'>{selection.date.split('-').reverse().join('/')}</div>
                </div>
                <div className='space-y-1'>
                  <Label className='text-[11px] font-bold text-gray-500 uppercase'>Các ca sử dụng</Label>
                  <div className='flex flex-wrap gap-1'>
                    {selection.slotIds
                      .sort((a, b) => a - b)
                      .map((sid) => {
                        const slot = slots?.find((s) => s.slotId === sid)
                        return (
                          <span
                            key={sid}
                            className='bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap'
                          >
                            {slot?.slotName || sid}{' '}
                            {slot && `(${formatTime(slot.startTime)} - ${formatTime(slot.endTime)})`}
                          </span>
                        )
                      })}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className='text-[14px] font-bold text-gray-500 uppercase block mb-2'>THIẾT BỊ SỬ DỤNG</Label>
              <div className='border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-2'>
                <table className='w-full text-sm text-left'>
                  <thead className='bg-primary/5 border-b-2 border-primary/10'>
                    <tr>
                      <th className='px-6 py-2 font-black text-primary uppercase text-xs tracking-wider'>
                        Tên thiết bị
                      </th>
                      <th className='px-6 py-2 font-black text-primary uppercase text-xs text-center tracking-wider'>
                        Hiện có
                      </th>
                      <th className='px-6 py-2 font-black text-primary uppercase text-xs text-center w-40 tracking-wider'>
                        Số lượng
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {isLoadingDevicesAvailability ? (
                      <tr>
                        <td colSpan={3} className='px-6 py-2'>
                          <div className='flex flex-col items-center justify-center text-slate-400 gap-2'>
                            <Loader2 className='h-6 w-6 animate-spin text-primary' />
                            <span className='font-medium text-xs'>Đang tải thiết bị...</span>
                          </div>
                        </td>
                      </tr>
                    ) : availableDevices && availableDevices.length > 0 ? (
                      availableDevices.map((item) => (
                        <tr key={item.deviceId} className='hover:bg-slate-50/50 transition-colors'>
                          <td className='px-6 py-2'>
                            <div className='font-bold text-gray-700'>{item.deviceName}</div>
                            <div className='text-[10px] text-gray-400 uppercase font-bold'>
                              {item.deviceType || 'Tài sản lab'}
                            </div>
                          </td>
                          <td className='px-6 py-2 text-center text-gray-500 font-mono font-bold'>
                            <span
                              className={cn(
                                'px-2 py-1 rounded-md text-[11px]',
                                item.availableQuantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                              )}
                            >
                              {item.availableQuantity}
                            </span>
                          </td>
                          <td className='px-6 py-2'>
                            <Input
                              type='number'
                              min={0}
                              max={item.availableQuantity}
                              value={deviceQuantities[item.deviceId] || ''}
                              onChange={(e) => handleQuantityChange(item.deviceId, Number(e.target.value))}
                              className='h-10 text-center font-bold border-gray-200'
                              placeholder='0'
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className='px-4 py-6 text-center text-gray-400 italic text-[11px]'>
                          Không có thiết bị khả dụng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className='space-y-1'>
              <Label className='text-[14px] font-bold text-gray-500 uppercase'>
                Mục đích sử dụng <span className='text-red-500 font-bold'>*</span>
              </Label>
              <Textarea
                placeholder='Thực hành môn, luyện tập nhóm...'
                className='min-h-[40px] h-10 py-1.5 resize-none border-gray-200 focus:border-primary text-xs'
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-3 pt-4'>
              <Button
                className='w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-black text-[13px] shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest'
                onClick={() => handleSaveBooking()}
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang xử lý...
                  </>
                ) : (
                  'Gửi yêu cầu đăng ký'
                )}
              </Button>
              <Button
                variant='outline'
                className='w-full border-gray-200 text-gray-500 h-10 rounded-xl font-bold text-xs hover:bg-gray-50 uppercase tracking-widest transition-all'
                onClick={onCancel}
              >
                Hủy bỏ
              </Button>
            </div>
          </div>
        </div>
      </div>
      {warningDialog && (
        <DuplicateConfirmDialog
          open={!!warningDialog}
          onOpenChange={(open) => {
            if (!open) {
              if (warningDialog.showCancel) {
                setWarningDialog(null)
              } else {
                finishBookingCreation()
              }
            }
          }}
          onConfirm={warningDialog.onConfirm}
          conflictDetails={warningDialog.conflictDetails}
          title={warningDialog.title}
          description={warningDialog.description}
          note={warningDialog.note}
          confirmLabel={warningDialog.confirmLabel}
          cancelLabel={warningDialog.cancelLabel}
          showCancel={warningDialog.showCancel ?? false}
        />
      )}
    </>
  )
}
