import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationCustomProps {
  currentPage: number
  totalPages: number
  totalItems: number
  limit: number
  onPageChange: (page: number) => void
  className?: string
}

const PaginationCustom = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  className
}: PaginationCustomProps) => {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  const startIdx = (currentPage - 1) * limit + 1
  const endIdx = Math.min(currentPage * limit, totalItems)

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4',
        className
      )}
    >
      <div className='text-[13px] font-semibold text-gray-500'>
        Hiển thị <span className='text-gray-900'>{startIdx}</span> đến <span className='text-gray-900'>{endIdx}</span>{' '}
        trong số <span className='text-gray-900'>{totalItems}</span> kết quả
      </div>

      <div className='flex items-center gap-1.5'>
        <Button
          variant='ghost'
          className='h-9 w-9 p-0 rounded-lg hover:bg-gray-100 border border-gray-100'
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className='h-4 w-4 text-gray-400' />
        </Button>

        {getVisiblePages().map((page, i) => (
          <div key={i}>
            {page === '...' ? (
              <span className='px-2 text-gray-400 font-bold'>...</span>
            ) : (
              <Button
                variant={currentPage === page ? 'default' : 'ghost'}
                className={cn(
                  'h-9 w-9 p-0 rounded-lg font-bold text-[13px]',
                  currentPage === page
                    ? 'bg-primary text-white shadow-none'
                    : 'text-gray-500 hover:bg-gray-100 border border-transparent'
                )}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )}
          </div>
        ))}

        <Button
          variant='ghost'
          className='h-9 w-9 p-0 rounded-lg hover:bg-gray-100 border border-gray-100'
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className='h-4 w-4 text-gray-400' />
        </Button>
      </div>
    </div>
  )
}

export default PaginationCustom
