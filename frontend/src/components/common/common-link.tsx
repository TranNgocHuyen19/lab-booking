import { Link, type LinkProps } from 'react-router'
import { cn } from '@/lib/utils'

interface CommonLinkProps extends LinkProps {
  className?: string
  bold?: boolean
}

export const CommonLink = ({ className, bold = false, ...props }: CommonLinkProps) => {
  return (
    <Link
      className={cn(
        'text-blue transition-opacity hover:opacity-80 underline-offset-4 hover:underline',
        bold ? 'font-bold' : 'font-medium',
        className
      )}
      {...props}
    />
  )
}

export default CommonLink
