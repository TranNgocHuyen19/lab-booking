import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from 'lucide-react'

const StudentSearchPage = () => {
  return (
    <div className='w-full px-6 md:px-20 lg:px-40 py-8 space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Tìm phòng lab</h1>
        <p className='mt-2 text-gray-600'>Tìm kiếm phòng lab có sẵn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Search className='h-5 w-5' />
            Tìm kiếm phòng
          </CardTitle>
          <CardDescription>Tìm phòng lab phù hợp với nhu cầu</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-gray-600'>Chức năng đang được phát triển...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default StudentSearchPage
