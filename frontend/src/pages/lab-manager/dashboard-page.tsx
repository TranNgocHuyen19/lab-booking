import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FlaskConical } from 'lucide-react'

const LabManagerPage = () => {
  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Quản lý phòng lab</h1>
          <p className='mt-2 text-gray-600'>Quản lý phòng lab, thiết bị và lịch sử dụng</p>
        </div>
        <FlaskConical className='h-12 w-12 text-purple-600' />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản lý Lab</CardTitle>
          <CardDescription>Các chức năng quản lý phòng lab</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-gray-600'>Chức năng đang được phát triển...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LabManagerPage
