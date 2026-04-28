import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AvatarOrInitials } from '@/components/AvatarOrInitials'
import { deleteContact } from '@/api/contacts'

function formatBirthday(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function ContactDetail({ open, onOpenChange, contact, onEdit, onDeleted }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  if (!contact) return null

  const birthday = formatBirthday(contact.birthday)

  async function handleConfirmDelete() {
    setDeleting(true)
    setError(null)
    try {
      await deleteContact(contact._id)
      setConfirmOpen(false)
      onDeleted?.(contact)
      onOpenChange(false)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete contact')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Contact details</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 pt-2">
            <AvatarOrInitials name={contact.name} photo={contact.photo} className="size-20" />
            <div className="text-xl font-semibold text-center">{contact.name}</div>
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <section>
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Phones</h3>
              <ul className="space-y-1 text-sm">
                {contact.phones?.map((p) => (
                  <li key={p._id || `${p.label}-${p.number}`} className="flex justify-between">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-medium">{p.number}</span>
                  </li>
                ))}
              </ul>
            </section>

            {birthday && (
              <section>
                <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Birthday</h3>
                <div className="text-sm">{birthday}</div>
              </section>
            )}

            {contact.notes && (
              <section>
                <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Notes</h3>
                <div className="text-sm whitespace-pre-wrap">{contact.notes}</div>
              </section>
            )}

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="size-4 mr-1" />
              Delete
            </Button>
            <Button onClick={() => onEdit?.(contact)}>
              <Pencil className="size-4 mr-1" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {contact.name} from your phonebook. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
