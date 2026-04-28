import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/initials'

export function AvatarOrInitials({ name, photo, className }) {
  const initials = getInitials(name)
  return (
    <Avatar className={className}>
      {photo ? <AvatarImage src={`/uploads/${photo}`} alt={name} /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
