import { History } from 'lucide-react'

const LecturerBookingHistoryPage = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <History className='h-8 w-8 text-primary' />
        <h1 className='text-2xl font-bold text-gray-900'>Lịch sử đặt phòng</h1>
      </div>
      <div className='rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
          <History className='h-8 w-8 text-primary' />
        </div>
        <h2 className='text-lg font-semibold text-gray-900'>Tính năng đang phát triển</h2>
        <p className='mt-2 text-gray-500'>Chức năng xem lịch sử đặt phòng sẽ sớm được cập nhật.</p>
      </div>
    </div>
  )
}

export default LecturerBookingHistoryPage
