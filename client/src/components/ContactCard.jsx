import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AvatarOrInitials } from '@/components/AvatarOrInitials'
import { cn } from '@/lib/utils'

export function ContactCard({ contact, onClick, onToggleFavorite }) {
  const primaryPhone = contact.phones?.[0]

  function handleStarClick(e) {
    e.stopPropagation()
    onToggleFavorite?.(contact)
  }

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/40"
      onClick={() => onClick?.(contact)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <AvatarOrInitials name={contact.name} photo={contact.photo} className="size-12" />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{contact.name}</div>
          {primaryPhone && (
            <div className="text-sm text-muted-foreground truncate">
              {primaryPhone.number}
            </div>
          )}
          {contact.tags && contact.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {contact.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {contact.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{contact.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
        {onToggleFavorite && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={contact.isFavorite}
            onClick={handleStarClick}
          >
            <Star
              className={cn(
                'size-5',
                contact.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              )}
            />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
