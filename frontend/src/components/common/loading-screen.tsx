import { Loader2 } from 'lucide-react'

const LoadingScreen = () => {
  return (
    <div className='flex h-screen w-full items-center justify-center bg-background'>
      <div className='flex flex-col items-center gap-4'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
        <p className='text-lg text-muted-foreground'>Đang tải...</p>
      </div>
    </div>
  )
}

export default LoadingScreen
