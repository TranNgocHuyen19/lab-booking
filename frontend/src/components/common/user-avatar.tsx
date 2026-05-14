import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name: string
  src?: string | null
  className?: string
  fallbackClassName?: string
}

export const getInitials = (fullName: string) => {
  if (!fullName) return ''
  const words = fullName.trim().split(/\s+/)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  const first = words[0].charAt(0)
  const last = words[words.length - 1].charAt(0)
  return (first + last).toUpperCase()
}

export const UserAvatar = ({ name, src, className, fallbackClassName }: UserAvatarProps) => {
  return (
    <Avatar className={cn('h-8 w-8', className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className={cn('bg-primary/10 text-primary font-bold', fallbackClassName)}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
