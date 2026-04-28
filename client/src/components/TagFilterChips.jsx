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
            variant={active ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer select-none transition-colors',
              !active && 'hover:bg-accent'
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
