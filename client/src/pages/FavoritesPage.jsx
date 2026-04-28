import { useState } from 'react'
import { ContactCard } from '@/components/ContactCard'
import { ContactDetail } from '@/components/ContactDetail'
import { ContactForm } from '@/components/ContactForm'
import { SearchBar } from '@/components/SearchBar'
import { TagFilterChips } from '@/components/TagFilterChips'
import { useContacts } from '@/hooks/useContacts'
import { useTags } from '@/hooks/useTags'
import { toggleFavorite } from '@/api/contacts'

export function FavoritesPage() {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  const { contacts, loading, error, reload } = useContacts({
    search,
    tags: selectedTags,
    favoritesOnly: true,
  })
  const { tags: availableTags, reload: reloadTags } = useTags()

  const [detailContact, setDetailContact] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  function openDetail(contact) {
    setDetailContact(contact)
    setDetailOpen(true)
  }

  function openEdit(contact) {
    setDetailOpen(false)
    setEditingContact(contact)
    setFormOpen(true)
  }

  async function handleToggleFavorite(contact) {
    try {
      await toggleFavorite(contact._id, !contact.isFavorite)
      reload()
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  function handleSaved() {
    reload()
    reloadTags()
    setEditingContact(null)
  }

  function handleDeleted() {
    reload()
    reloadTags()
  }

  const isFiltering = search.length > 0 || selectedTags.length > 0

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Favorites</h1>

      <SearchBar value={search} onChange={setSearch} />

      <TagFilterChips
        availableTags={availableTags}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
      />

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : contacts.length === 0 ? (
        <div className="rounded-md border border-dashed py-12 text-center text-muted-foreground">
          {isFiltering
            ? 'No favorites match your search.'
            : 'No favorites yet. Tap the star on a contact to add it here.'}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contacts.map((contact) => (
            <ContactCard
              key={contact._id}
              contact={contact}
              onClick={openDetail}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editingContact}
        onSaved={handleSaved}
      />

      <ContactDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        contact={detailContact}
        onEdit={openEdit}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
