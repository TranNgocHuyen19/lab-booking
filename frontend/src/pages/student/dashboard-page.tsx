import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard } from 'lucide-react'

const DashboardPage = () => {
  return (
    <div className='w-full px-6 md:px-20 lg:px-40 py-8 space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
        <p className='mt-2 text-gray-600'>Chào mừng bạn đến với hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <LayoutDashboard className='h-5 w-5' />
            Tổng quan
          </CardTitle>
          <CardDescription>Thông tin tổng quan hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-gray-600'>Dashboard đang được phát triển...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
