const fs = require('node:fs/promises')
const path = require('node:path')
const Contact = require('../models/Contact')

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')

const EDITABLE_FIELDS = ['name', 'phones', 'birthday', 'notes', 'tags']
const CREATABLE_FIELDS = [...EDITABLE_FIELDS, 'isFavorite']

function pick(obj, keys) {
  const out = {}
  for (const key of keys) {
    if (obj[key] !== undefined) out[key] = obj[key]
  }
  return out
}

function notFound() {
  const err = new Error('Contact not found')
  err.status = 404
  return err
}

async function unlinkPhoto(filename) {
  if (!filename) return
  try {
    await fs.unlink(path.join(UPLOADS_DIR, filename))
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`Failed to delete photo ${filename}:`, err.message)
    }
  }
}

async function listContacts(req, res) {
  const filter = {}

  if (req.query.search) {
    const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'i')
    filter.$or = [{ name: regex }, { 'phones.number': regex }]
  }

  if (req.query.tags) {
    const tags = req.query.tags.split(',').map((t) => t.trim()).filter(Boolean)
    if (tags.length) filter.tags = { $all: tags }
  }

  if (req.query.favoritesOnly === 'true') {
    filter.isFavorite = true
  }

  const contacts = await Contact.find(filter).sort({ name: 1 })
  res.json(contacts)
}

async function getContact(req, res) {
  const contact = await Contact.findById(req.params.id)
  if (!contact) throw notFound()
  res.json(contact)
}

async function createContact(req, res) {
  const body = pick(req.body || {}, CREATABLE_FIELDS)
  const contact = await Contact.create(body)
  res.status(201).location(`/api/contacts/${contact._id}`).json(contact)
}

async function updateContact(req, res) {
  const updates = pick(req.body || {}, EDITABLE_FIELDS)
  const contact = await Contact.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
  if (!contact) throw notFound()
  res.json(contact)
}

async function deleteContact(req, res) {
  const contact = await Contact.findByIdAndDelete(req.params.id)
  if (!contact) throw notFound()
  await unlinkPhoto(contact.photo)
  res.status(204).end()
}

async function toggleFavorite(req, res) {
  if (typeof req.body?.isFavorite !== 'boolean') {
    const err = new Error('isFavorite must be a boolean')
    err.status = 400
    throw err
  }
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { isFavorite: req.body.isFavorite },
    { new: true }
  )
  if (!contact) throw notFound()
  res.json(contact)
}

module.exports = {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
}
