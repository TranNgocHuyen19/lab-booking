import { useState, useMemo } from 'react'
import { CheckCircle2, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { InfiniteScrollMultipleSelect } from '@/components/common/infinite-scroll-multiple-select'
import { researchGroupService } from '@/services/research-group.service'
import { useDeviceAvailabilityQuery } from '@/queries/device.queries'
import {
  DialogAddAuditingParticipant,
  type AuditingParticipant
} from '@/components/lecturer/booking/dialog-add-auditing-participant'
import {
  MemberRole,
  MemberRoleLabel,
  ParticipantRole,
  ParticipantRoleLabels,
  type ParticipantRoleType
} from '@/constants/types'
import { formatTime } from '@/utils/format'
import { sortParticipantsByRole } from '@/utils/participant'
import { useCreateBookingMutation } from '@/queries/booking.queries'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CreateBookingRequest } from '@/schemas/booking.schema'
import type { MemberInfoResponse, SecureResearchGroupResponse } from '@/schemas/research-group.schema'
import type { SlotResponse } from '@/schemas/slot.schema'
import type { UserResponse } from '@/schemas/user.schema'
import { handleBookingCreateError, showBookingCreateFeedback } from '@/utils/booking-create-feedback'

interface LecturerBookingFormProps {
  selection: { roomId: number; date: string; slotIds: number[] }
  currentUser: UserResponse | null
  managedGroups: SecureResearchGroupResponse[]
  slots: SlotResponse[]
  currentRoomName: string
  onCancel: () => void
  onSuccess: () => void
}

export const LecturerBookingForm = ({
  selection,
  currentUser,
  managedGroups,
  slots,
  currentRoomName,
  onCancel,
  onSuccess
}: LecturerBookingFormProps) => {
  const queryClient = useQueryClient()
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [auditingParticipants, setAuditingParticipants] = useState<AuditingParticipant[]>([])
  const [purpose, setPurpose] = useState<string>('')
  const [deviceQuantities, setDeviceQuantities] = useState<Record<number, number>>({})
  const [showMembers, setShowMembers] = useState<boolean>(false)

  const { data: devicesAvailabilityRes, isLoading: isLoadingDevicesAvailability } = useDeviceAvailabilityQuery({
    labRoomId: selection.roomId,
    date: selection.date,
    slotIds: selection.slotIds
  })
  const availableDevices = devicesAvailabilityRes?.data || []

  const memberQueries = useQueries({
    queries: selectedGroups.map((groupId) => ({
      queryKey: ['research-groups', Number(groupId), 'members'],
      queryFn: async () => {
        const response = await researchGroupService.findMembersByGroupId(Number(groupId))
        return response.data.data?.data || []
      },
      enabled: !!groupId
    }))
  })

  const allMembers = useMemo(() => {
    const membersMap = new Map<string, MemberInfoResponse>()
    memberQueries.forEach((query) => {
      if (query.data) {
        query.data.forEach((m: MemberInfoResponse) => {
          membersMap.set(m.username, m)
        })
      }
    })
    return sortParticipantsByRole(Array.from(membersMap.values()), currentUser?.username)
  }, [memberQueries, currentUser?.username])

  const isLoadingMembers = memberQueries.some((q) => q.isLoading)
  const createBookingMutation = useCreateBookingMutation()

  const handleQuantityChange = (deviceId: number, quantity: number) => {
    setDeviceQuantities((prev) => ({
      ...prev,
      [deviceId]: quantity
    }))
  }

  const handleSaveBooking = async () => {
    if (!purpose.trim()) {
      toast.error('Vui lòng nhập mục đích sử dụng')
      return
    }

    if (selectedGroups.length === 0) {
      toast.error('Vui lòng chọn nhóm nghiên cứu / Đề tài')
      return
    }
    if (allMembers.length === 0) {
      toast.error('Nhóm được chọn không có thành viên')
      return
    }

    try {
      const devices = Object.entries(deviceQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({
          deviceId: Number(id),
          quantity: qty
        }))

      const groupParticipants = allMembers.map((m: MemberInfoResponse) => ({
        userId: m.userId,
        role: (m.username === currentUser?.username
          ? ParticipantRole.SUPERVISOR
          : ParticipantRole.PRESENTER) as ParticipantRoleType
      }))

      const auditingList = auditingParticipants.map((p: AuditingParticipant) => ({
        userId: p.userId,
        role: p.role as ParticipantRoleType
      }))

      const payload: CreateBookingRequest = {
        labRoomId: selection.roomId,
        slots: selection.slotIds.map((slotId) => ({
          slotId,
          bookingDate: selection.date
        })),
        bookingType: 'THESIS',
        purpose,
        participants: [...groupParticipants, ...auditingList],
        researchGroupIds: selectedGroups.map(Number),
        devices
      }

      const response = await createBookingMutation.mutateAsync(payload)
      showBookingCreateFeedback(response)
      onSuccess()
      queryClient.invalidateQueries({ queryKey: ['labRooms', 'schedule'] })
    } catch (error: unknown) {
      handleBookingCreateError(error)
    }
  }

  return (
    <>
      <div className='animate-in fade-in slide-in-from-top-4 duration-500'>
        <div className='w-full bg-white rounded-md border border-slate-200 p-4 shadow-sm'>
          <div className='flex items-center gap-2 mb-4 border-b border-slate-100 pb-2'>
            <div className='bg-primary/10 p-1.5 rounded-lg text-primary'>
              <CheckCircle2 className='h-5 w-5' />
            </div>
            <h2 className='text-[14px] font-bold text-gray-500 uppercase tracking-tight'>
              THÔNG TIN ĐĂNG KÝ PHÒNG LAB - BÁO CÁO ĐỀ TÀI
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1'>
            <div className='md:col-span-2 space-y-1'>
              <Label className='text-[14px] font-bold text-gray-500 uppercase tracking-wider'>
                Nhóm nghiên cứu / Đề tài
              </Label>
              <InfiniteScrollMultipleSelect
                value={selectedGroups}
                onValueChange={setSelectedGroups}
                placeholder='-- Chọn một hoặc nhiều nhóm nghiên cứu --'
                items={managedGroups}
                getItemValue={(group: SecureResearchGroupResponse) => group.researchGroupId.toString()}
                getItemLabel={(group: SecureResearchGroupResponse) => `${group.groupName} - ${group.leaderName}`}
                hasMore={false}
                isLoading={false}
                onLoadMore={() => {}}
              />
            </div>

            {selectedGroups.length > 0 && (
              <div className='md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2'>
                <div className='flex items-center justify-between mb-1'>
                  <h3 className='text-[14px] font-bold text-gray-500 uppercase flex items-center gap-2'>
                    THÀNH VIÊN THAM GIA ({allMembers.length})
                  </h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 px-3 text-[11px] font-bold text-primary hover:bg-primary/5'
                    onClick={() => setShowMembers(!showMembers)}
                  >
                    {showMembers ? 'ẨN DANH SÁCH >>' : 'HIỆN DANH SÁCH >>'}
                  </Button>
                </div>

                {showMembers && (
                  <div className='bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm'>
                    <div className='max-h-[200px] overflow-y-auto'>
                      <table className='w-full text-sm text-left text-gray-500'>
                        <thead className='text-xs text-primary uppercase bg-slate-50 sticky top-0 z-10'>
                          <tr>
                            <th className='px-6 py-2 font-bold'>MSSV / MSGV</th>
                            <th className='px-6 py-2 font-bold'>Họ tên</th>
                            <th className='px-6 py-2 font-bold text-center'>Vai trò trong nhóm</th>
                            <th className='px-6 py-2 font-bold text-center'>Vai trò báo cáo</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                          {isLoadingMembers ? (
                            <tr>
                              <td colSpan={4} className='px-6 py-10 text-center'>
                                <div className='flex items-center justify-center gap-2'>
                                  <Loader2 className='h-6 w-6 animate-spin text-primary' />
                                  <span className='font-medium text-xs'>Đang tải thành viên...</span>
                                </div>
                              </td>
                            </tr>
                          ) : allMembers.length > 0 ? (
                            allMembers.map((m: MemberInfoResponse) => (
                              <tr key={m.username} className='bg-white border-b hover:bg-gray-50 transition-colors'>
                                <td className='px-6 py-2 font-medium text-gray-500 whitespace-nowrap'>{m.username}</td>
                                <td className='px-6 py-2 text-gray-800 font-bold'>
                                  {m.fullName} {m.username === currentUser?.username && '(Bạn)'}
                                </td>
                                <td className='px-6 py-2 text-center'>
                                  <span
                                    className={cn(
                                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                                      m.role === MemberRole.LEADER
                                        ? 'bg-amber-100 text-amber-700'
                                        : m.role === MemberRole.CO_LEADER
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-gray-100 text-gray-600'
                                    )}
                                  >
                                    {MemberRoleLabel[m.role as keyof typeof MemberRoleLabel] || m.role}
                                  </span>
                                </td>
                                <td className='px-6 py-2 text-center'>
                                  <span
                                    className={cn(
                                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                                      m.username === currentUser?.username
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    )}
                                  >
                                    {m.username === currentUser?.username
                                      ? ParticipantRoleLabels[ParticipantRole.SUPERVISOR]
                                      : ParticipantRoleLabels[ParticipantRole.PRESENTER]}
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

            <div className='md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2 mb-2'>
              <div className='flex items-center justify-between'>
                <h3 className='text-[14px] font-bold text-gray-500 uppercase flex items-center gap-2'>
                  THÀNH VIÊN DỰ THÍNH / HỘI ĐỒNG ({auditingParticipants.length})
                </h3>
                <DialogAddAuditingParticipant
                  currentParticipants={auditingParticipants}
                  excludedUsernames={allMembers.map((m) => m.username)}
                  onAdd={(p) => setAuditingParticipants((prev) => [...prev, p])}
                >
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 px-3 text-[11px] font-bold text-primary hover:bg-primary/5'
                  >
                    THÊM THÀNH VIÊN {'>>'}
                  </Button>
                </DialogAddAuditingParticipant>
              </div>

              {auditingParticipants.length > 0 && (
                <div className='bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm'>
                  <div className='max-h-[160px] overflow-y-auto'>
                    <table className='w-full text-sm text-left text-gray-500'>
                      <thead className='text-xs text-primary uppercase bg-slate-50 sticky top-0 z-10'>
                        <tr>
                          <th className='px-4 py-2 w-10'></th>
                          <th className='px-6 py-2 font-bold'>MSSV / MSGV</th>
                          <th className='px-6 py-2 font-bold'>Họ tên</th>
                          <th className='px-6 py-2 font-bold text-center'>Vai trò báo cáo</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-100'>
                        {sortParticipantsByRole(auditingParticipants, currentUser?.username).map((p) => (
                          <tr key={p.username} className='bg-white border-b hover:bg-gray-50 transition-colors'>
                            <td className='px-4 py-1 text-center'>
                              <Button
                                variant='ghost'
                                type='button'
                                size='icon'
                                className='h-6 w-6 text-gray-400 hover:text-red-500 transition-colors'
                                onClick={() =>
                                  setAuditingParticipants((prev) => prev.filter((item) => item.username !== p.username))
                                }
                              >
                                <Trash2 className='h-3.5 w-3.5' />
                              </Button>
                            </td>
                            <td className='px-6 py-1 font-medium text-gray-500'>{p.username}</td>
                            <td className='px-6 py-1 text-gray-800 font-bold'>{p.fullName}</td>
                            <td className='px-6 py-1 text-center'>
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                                  p.role === ParticipantRole.COMMITTEE
                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                )}
                              >
                                {ParticipantRoleLabels[p.role as keyof typeof ParticipantRoleLabels]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className='md:col-span-2'>
              <h3 className='text-[14px] font-bold text-gray-500 mb-1 uppercase'>PHÒNG & THỜI GIAN</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 mb-2 px-4'>
                <div className='space-y-0.5'>
                  <Label className='text-[11px] font-bold text-gray-400 uppercase'>Phòng Lab</Label>
                  <div className='font-bold text-primary text-sm'>{currentRoomName || '...'}</div>
                </div>
                <div className='space-y-0.5'>
                  <Label className='text-[11px] font-bold text-gray-400 uppercase'>Ngày sử dụng</Label>
                  <div className='font-bold text-gray-700 text-sm font-mono'>
                    {selection.date.split('-').reverse().join('/')}
                  </div>
                </div>
                <div className='space-y-0.5'>
                  <Label className='text-[11px] font-bold text-gray-400 uppercase'>Các ca sử dụng</Label>
                  <div className='flex flex-wrap gap-1'>
                    {selection.slotIds
                      .sort((a, b) => a - b)
                      .map((sid) => {
                        const slot = slots?.find((s) => s.slotId === sid)
                        return (
                          <span
                            key={sid}
                            className='bg-white border border-primary/20 text-primary text-[12px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-sm'
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

            <div className='md:col-span-2'>
              <Label className='text-[14px] font-bold text-gray-500 uppercase block mb-1'>THIẾT BỊ SỬ DỤNG</Label>
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
                        <td colSpan={3} className='px-6 py-10'>
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
                              className='h-8 text-center font-bold border-gray-200'
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

            <div className='md:col-span-2 space-y-1'>
              <Label className='text-[14px] font-bold text-gray-500 uppercase'>
                Mục đích sử dụng <span className='text-red-500 font-bold'>*</span>
              </Label>
              <Textarea
                placeholder='Vui lòng nhập mục đích báo cáo, tên đề tài...'
                className='min-h-[80px] border-slate-200 focus:border-primary shadow-sm'
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
          </div>

          <div className='flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100'>
            <Button
              variant='outline'
              onClick={onCancel}
              className='px-6 border-slate-200 text-slate-500 hover:bg-slate-50 font-bold'
            >
              HỦY BỎ
            </Button>
            <Button
              onClick={() => handleSaveBooking()}
              disabled={createBookingMutation.isPending}
              className='px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-md active:scale-95 transition-all'
            >
              {createBookingMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ĐANG XỬ LÝ...
                </>
              ) : (
                'XÁC NHẬN ĐĂNG KÝ'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
