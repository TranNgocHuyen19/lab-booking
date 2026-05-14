import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorScreenProps {
  title?: string
  message?: string
  onRetry?: () => void
}

/**
 * Error screen component
 * Displayed when an error occurs during data fetching or operations
 */
const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  onRetry
}) => {
  return (
    <div className='flex h-screen w-full items-center justify-center bg-background'>
      <div className='flex max-w-md flex-col items-center gap-4 text-center'>
        <AlertCircle className='h-16 w-16 text-destructive' />
        <h2 className='text-2xl font-bold'>{title}</h2>
        <p className='text-muted-foreground'>{message}</p>
        {onRetry && (
          <Button onClick={onRetry} className='mt-4'>
            Thử lại
          </Button>
        )}
      </div>
    </div>
  )
}

export default ErrorScreen
