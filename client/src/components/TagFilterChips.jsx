import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function TagFilterChips({ availableTags, selectedTags, onChange }) {
  if (!availableTags || availableTags.length === 0) return null

  function toggle(tag) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    onChange(next)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableTags.map((tag) => {
        const active = selectedTags.includes(tag)
        return (
          <Badge
            key={tag}
            variant={active ? 'default' : 'secondary'}
            className={cn(
              'cursor-pointer select-none rounded-full px-3 py-0.5 text-xs font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-primary/10 text-primary border-transparent hover:bg-primary/15'
            )}
            onClick={() => toggle(tag)}
          >
            {tag}
          </Badge>
        )
      })}
    </div>
  )
}
