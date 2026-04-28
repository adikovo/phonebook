import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContactCard } from '@/components/ContactCard'
import { ContactForm } from '@/components/ContactForm'
import { ContactDetail } from '@/components/ContactDetail'
import { useContacts } from '@/hooks/useContacts'

export function AllContactsPage() {
  const { contacts, loading, error, reload } = useContacts()

  const [detailContact, setDetailContact] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  function openDetail(contact) {
    setDetailContact(contact)
    setDetailOpen(true)
  }

  function openCreate() {
    setEditingContact(null)
    setFormOpen(true)
  }

  function openEdit(contact) {
    setDetailOpen(false)
    setEditingContact(contact)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Contacts</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4 mr-1" />
          Add contact
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : contacts.length === 0 ? (
        <div className="rounded-md border border-dashed py-12 text-center text-muted-foreground">
          <p className="mb-2">No contacts yet.</p>
          <Button variant="outline" onClick={openCreate}>
            Add your first contact
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {contacts.map((contact) => (
            <ContactCard key={contact._id} contact={contact} onClick={openDetail} />
          ))}
        </div>
      )}

      <ContactForm
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editingContact}
        onSaved={() => {
          reload()
          setEditingContact(null)
        }}
      />

      <ContactDetail
        open={detailOpen}
        onOpenChange={setDetailOpen}
        contact={detailContact}
        onEdit={openEdit}
        onDeleted={() => reload()}
      />
    </div>
  )
}
