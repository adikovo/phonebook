import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createContact, updateContact, uploadPhoto, deletePhoto } from '@/api/contacts'
import { useTags } from '@/hooks/useTags'
import { getInitials } from '@/lib/initials'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif'

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
      tags: [],
    }
  }
  return {
    name: contact.name || '',
    phones: contact.phones?.length
      ? contact.phones.map(phoneToFormState)
      : [emptyPhone()],
    birthday: contact.birthday ? contact.birthday.slice(0, 10) : '',
    notes: contact.notes || '',
    tags: contact.tags || [],
  }
}

export function ContactForm({ open, onOpenChange, contact, onSaved }) {
  const isEdit = Boolean(contact)
  const [form, setForm] = useState(() => buildInitialState(contact))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [tagInput, setTagInput] = useState('')
  const [tagInputFocused, setTagInputFocused] = useState(false)
  const tagBlurTimeout = useRef(null)
  const { tags: allTags } = useTags()

  const [photoFile, setPhotoFile] = useState(null)
  const [removePhotoFlag, setRemovePhotoFlag] = useState(false)
  const [photoError, setPhotoError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(photoFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [photoFile])

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('File exceeds 5MB limit')
      return
    }
    setPhotoFile(file)
    setRemovePhotoFlag(false)
    setPhotoError(null)
  }

  function handleRemovePhoto() {
    setPhotoFile(null)
    setRemovePhotoFlag(true)
    setPhotoError(null)
  }

  const displayedPhotoUrl = photoFile
    ? previewUrl
    : removePhotoFlag
    ? null
    : contact?.photo
    ? `/uploads/${contact.photo}`
    : null

  const canRemovePhoto = !photoFile && !removePhotoFlag && Boolean(contact?.photo)

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

  function addTag(raw) {
    const tag = raw.trim()
    if (!tag) return
    if (form.tags.includes(tag)) {
      setTagInput('')
      return
    }
    setForm((f) => ({ ...f, tags: [...f.tags, tag] }))
    setTagInput('')
  }

  function removeTag(tag) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      if (tagInput.trim()) {
        e.preventDefault()
        addTag(tagInput)
      }
    } else if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      removeTag(form.tags[form.tags.length - 1])
    }
  }

  const suggestions = allTags
    .filter((t) => typeof t === 'string' && t.length > 0)
    .filter((t) => !form.tags.includes(t))
    .filter((t) => t.toLowerCase().includes(tagInput.toLowerCase()))
    .slice(0, 8)

  const showSuggestions = tagInputFocused && tagInput.length > 0 && suggestions.length > 0

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const tagsToSave = tagInput.trim() ? [...form.tags, tagInput.trim()] : form.tags

    const body = {
      name: form.name.trim(),
      phones: form.phones.map((p) => ({
        number: p.number.trim(),
        label: p.labelType === 'Custom' ? p.customLabel.trim() : p.labelType,
      })),
      birthday: form.birthday || null,
      notes: form.notes,
      tags: Array.from(new Set(tagsToSave)),
    }

    try {
      let saved = isEdit
        ? await updateContact(contact._id, body)
        : await createContact(body)

      if (photoFile) {
        saved = await uploadPhoto(saved._id, photoFile)
      } else if (removePhotoFlag && saved.photo) {
        saved = await deletePhoto(saved._id)
      }

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

          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              {displayedPhotoUrl && <AvatarImage src={displayedPhotoUrl} alt={form.name} />}
              <AvatarFallback>{getInitials(form.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="size-4 mr-1" />
                  {displayedPhotoUrl ? 'Change photo' : 'Add photo'}
                </Button>
                {canRemovePhoto && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                  >
                    Remove photo
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES}
                className="hidden"
                onChange={handlePhotoSelect}
              />
              {photoError ? (
                <p className="text-xs text-destructive">{photoError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">JPEG, PNG, WebP, or GIF · max 5MB</p>
              )}
            </div>
          </div>

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

          <div className="space-y-2 relative">
            <Label htmlFor="tag-input">Tags</Label>
            <div className="flex flex-wrap gap-2 rounded-md border bg-transparent p-2 min-h-10 focus-within:ring-2 focus-within:ring-ring">
              {form.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove ${tag}`}
                    className="rounded-sm hover:bg-foreground/10"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onFocus={() => {
                  if (tagBlurTimeout.current) clearTimeout(tagBlurTimeout.current)
                  setTagInputFocused(true)
                }}
                onBlur={() => {
                  tagBlurTimeout.current = setTimeout(() => setTagInputFocused(false), 120)
                }}
                placeholder={form.tags.length === 0 ? 'Add a tag and press Enter…' : ''}
                className="flex-1 min-w-24 bg-transparent text-sm outline-none"
              />
            </div>
            {showSuggestions && (
              <div className="absolute left-0 right-0 z-10 mt-1 rounded-md border bg-popover p-1 shadow-md">
                {suggestions.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      addTag(s)
                    }}
                    className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
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
