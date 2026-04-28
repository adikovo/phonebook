import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createContact, updateContact } from '@/api/contacts'

const PRESET_LABELS = ['Mobile', 'Home', 'Work']

function emptyPhone() {
  return { number: '', labelType: 'Mobile', customLabel: '' }
}

function phoneToFormState(phone) {
  const isPreset = PRESET_LABELS.includes(phone.label)
  return {
    number: phone.number,
    labelType: isPreset ? phone.label : 'Custom',
    customLabel: isPreset ? '' : phone.label,
  }
}

function buildInitialState(contact) {
  if (!contact) {
    return {
      name: '',
      phones: [emptyPhone()],
      birthday: '',
      notes: '',
      tags: '',
    }
  }
  return {
    name: contact.name || '',
    phones: contact.phones?.length
      ? contact.phones.map(phoneToFormState)
      : [emptyPhone()],
    birthday: contact.birthday ? contact.birthday.slice(0, 10) : '',
    notes: contact.notes || '',
    tags: (contact.tags || []).join(', '),
  }
}

export function ContactForm({ open, onOpenChange, contact, onSaved }) {
  const isEdit = Boolean(contact)
  const [form, setForm] = useState(() => buildInitialState(contact))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(contact))
      setError(null)
    }
  }, [open, contact])

  function updatePhone(index, patch) {
    setForm((f) => ({
      ...f,
      phones: f.phones.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }))
  }

  function addPhone() {
    setForm((f) => ({ ...f, phones: [...f.phones, emptyPhone()] }))
  }

  function removePhone(index) {
    setForm((f) => ({
      ...f,
      phones: f.phones.length === 1 ? f.phones : f.phones.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const body = {
      name: form.name.trim(),
      phones: form.phones.map((p) => ({
        number: p.number.trim(),
        label: p.labelType === 'Custom' ? p.customLabel.trim() : p.labelType,
      })),
      birthday: form.birthday || null,
      notes: form.notes,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    try {
      const saved = isEdit
        ? await updateContact(contact._id, body)
        : await createContact(body)
      onSaved?.(saved)
      onOpenChange(false)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save contact')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit contact' : 'Add contact'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Phones</Label>
            {form.phones.map((phone, i) => (
              <div key={i} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Number"
                    value={phone.number}
                    onChange={(e) => updatePhone(i, { number: e.target.value })}
                    required
                    className="flex-1"
                  />
                  <Select
                    value={phone.labelType}
                    onValueChange={(value) => updatePhone(i, { labelType: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_LABELS.map((label) => (
                        <SelectItem key={label} value={label}>
                          {label}
                        </SelectItem>
                      ))}
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePhone(i)}
                    disabled={form.phones.length === 1}
                    aria-label="Remove phone"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                {phone.labelType === 'Custom' && (
                  <Input
                    placeholder="Custom label"
                    value={phone.customLabel}
                    onChange={(e) => updatePhone(i, { customLabel: e.target.value })}
                    required
                    maxLength={20}
                  />
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPhone}
              disabled={form.phones.length >= 10}
            >
              <Plus className="size-4 mr-1" />
              Add phone
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Family, Work, Friends"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Separate multiple tags with commas.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
