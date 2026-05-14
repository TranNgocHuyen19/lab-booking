import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MemberRole, ParticipantRole, MemberRoleLabel, ParticipantRoleLabels } from '@/constants/types'
import type { SlotBookingDetailParticipant } from '@/schemas/booking.schema'

interface ParticipantsTableProps {
  participants: SlotBookingDetailParticipant[] | undefined
  isLoading?: boolean
}

export const ParticipantsTable = ({ participants, isLoading }: ParticipantsTableProps) => {
  if (isLoading) {
    return (
      <div className='border rounded-lg p-8 flex items-center justify-center bg-white'>
        <Loader2 className='h-6 w-6 animate-spin text-primary' />
        <span className='ml-2 text-gray-500'>Đang tải...</span>
      </div>
    )
  }

  const displayList = participants || []

  return (
    <div className='border rounded-lg overflow-hidden bg-white shadow-sm'>
      <table className='w-full text-sm text-left'>
        <thead className='bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold'>
          <tr>
            <th className='px-6 py-4'>STT</th>
            <th className='px-6 py-4'>Họ và tên</th>
            <th className='px-6 py-4'>MSSV</th>
            <th className='px-6 py-4 text-center'>Vai trò</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-50'>
          {displayList.length === 0 ? (
            <tr>
              <td colSpan={4} className='px-4 py-8 text-center text-gray-400 italic'>
                Chưa có thông tin thành viên
              </td>
            </tr>
          ) : (
            displayList.map((p, idx) => (
              <tr key={idx} className='hover:bg-blue-50/50 transition-colors'>
                <td className='px-6 py-4 font-medium text-gray-500 w-16 text-center text-sm'>{idx + 1}</td>
                <td className='px-6 py-4 font-bold text-gray-700 text-sm'>
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold'>
                      {p.fullName ? p.fullName.charAt(0) : 'U'}
                    </div>
                    {p.fullName || 'N/A'}
                  </div>
                </td>
                <td className='px-6 py-4 text-gray-600 font-mono text-sm'>{p.username || 'N/A'}</td>
                <td className='px-6 py-4 text-center'>
                  <Badge
                    variant={
                      p.memberRole === MemberRole.LEADER || p.role === ParticipantRole.SUPERVISOR ? 'leader' : 'member'
                    }
                    className='text-xs px-2.5 h-6'
                  >
                    {p.memberRole
                      ? MemberRoleLabel[p.memberRole as keyof typeof MemberRoleLabel] || p.memberRole
                      : ParticipantRoleLabels[p.role as keyof typeof ParticipantRoleLabels] || p.role}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
