import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const DEBOUNCE_MS = 150

export function SearchBar({ value, onChange, placeholder = 'Search by name or phone…' }) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    if (local === value) return
    const t = setTimeout(() => onChange(local), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [local, value, onChange])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {local && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear search"
          className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
          onClick={() => setLocal('')}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}
