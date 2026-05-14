import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface TableSkeletonProps {
  columnCount: number
  rowCount?: number
  className?: string
  cellClassName?: string
}

export const TableSkeleton = ({ columnCount, rowCount = 5, className, cellClassName }: TableSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i} className={cn('border-b border-gray-100', className)}>
          {Array.from({ length: columnCount }).map((_, j) => (
            <TableCell key={j} className={cn('py-4', cellClassName)}>
              <div className='h-6 bg-gray-100 animate-pulse rounded-md w-full' />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default TableSkeleton
