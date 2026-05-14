import { Outlet } from 'react-router'

const AuthLayout = () => {
  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-muted-foreground p-4'>
      <Outlet />
    </div>
  )
}

export default AuthLayout
