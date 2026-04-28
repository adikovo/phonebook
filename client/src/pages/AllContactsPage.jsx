import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContactCard } from '@/components/ContactCard'
import { ContactForm } from '@/components/ContactForm'
import { ContactDetail } from '@/components/ContactDetail'
import { SearchBar } from '@/components/SearchBar'
import { TagFilterChips } from '@/components/TagFilterChips'
import { useContacts } from '@/hooks/useContacts'
import { useTags } from '@/hooks/useTags'
import { toggleFavorite } from '@/api/contacts'

export function AllContactsPage() {
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  const { contacts, loading, error, reload } = useContacts({ search, tags: selectedTags })
  const { tags: availableTags, reload: reloadTags } = useTags()

  const [detailContact, setDetailContact] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [formSession, setFormSession] = useState(0)

  function openDetail(contact) {
    setDetailContact(contact)
    setDetailOpen(true)
  }

  function openCreate() {
    setEditingContact(null)
    setFormSession((s) => s + 1)
    setFormOpen(true)
  }

  function openEdit(contact) {
    setDetailOpen(false)
    setEditingContact(contact)
    setFormSession((s) => s + 1)
    setFormOpen(true)
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

  async function handleToggleFavorite(contact) {
    try {
      await toggleFavorite(contact._id, !contact.isFavorite)
      reload()
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }

  const isFiltering = search.length > 0 || selectedTags.length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">All Contacts</h1>
        <Button onClick={openCreate} size="sm" className="rounded-full">
          <Plus className="size-4 mr-1" />
          Add contact
        </Button>
      </div>

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
        isFiltering ? (
          <div className="rounded-md border border-dashed py-12 text-center text-muted-foreground">
            No contacts match your search.
          </div>
        ) : (
          <div className="rounded-md border border-dashed py-12 text-center text-muted-foreground">
            <p className="mb-2">No contacts yet.</p>
            <Button variant="outline" onClick={openCreate}>
              Add your first contact
            </Button>
          </div>
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
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
        key={formSession}
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
