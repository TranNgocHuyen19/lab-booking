import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface StudentBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export const StudentBreadcrumb = ({ items, className }: StudentBreadcrumbProps) => {
  return (
    <nav
      className={cn(
        'flex items-center gap-2 text-sm font-bold text-gray-500 bg-white w-fit px-5 py-2.5 rounded-full border border-slate-200 shadow-sm',
        className
      )}
    >
      {items.map((item, index) => (
        <div key={index} className='flex items-center gap-2'>
          {index > 0 && <ChevronRight className='h-4 w-4 text-gray-300 shrink-0' />}
          {item.href ? (
            <Link to={item.href} className='hover:text-primary transition-colors whitespace-nowrap'>
              {item.label}
            </Link>
          ) : (
            <span className='text-primary bg-primary/5 px-3 py-0.5 rounded-full whitespace-nowrap'>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
