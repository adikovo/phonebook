/*
 * ============================================================
 * contactsController.js
 * Express controller handling all contact-related business
 * logic: listing, creating, updating, deleting contacts, and
 * managing profile photo uploads/removals.
 * ============================================================
 */

const fs = require('node:fs/promises')
const path = require('node:path')
const Contact = require('../models/Contact')

// Absolute path to the directory where uploaded photos are stored
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')

// Fields that can be modified on an existing contact via PUT/PATCH
const EDITABLE_FIELDS = ['name', 'phones', 'birthday', 'notes', 'tags']
// Fields allowed during contact creation (superset of EDITABLE_FIELDS)
const CREATABLE_FIELDS = [...EDITABLE_FIELDS, 'isFavorite']

// Extracts only the specified keys from obj, ignoring undefined values.
// Params: obj - source object, keys - array of property names to pick.
// Returns: a new object containing only the requested keys.
function pick(obj, keys) {
  const out = {}
  for (const key of keys) {
    if (obj[key] !== undefined) out[key] = obj[key]
  }
  return out
}

// Creates and returns a 404 error for when a contact ID is not found in the DB.
function notFound() {
  const err = new Error('Contact not found')
  err.status = 404
  return err
}

// Deletes a photo file from the uploads directory on disk.
// Params: filename - the name of the file to remove (not the full path).
// Silently ignores the error if the file is already gone (ENOENT).
async function unlinkPhoto(filename) {
  if (!filename) return
  try {
    await fs.unlink(path.join(UPLOADS_DIR, filename))
  } catch (err) {
    // Only warn for unexpected errors; missing files are not a problem
    if (err.code !== 'ENOENT') {
      console.warn(`Failed to delete photo ${filename}:`, err.message)
    }
  }
}

// Lists all contacts, with optional filtering by search term, tags, and favorites.
// Params: req.query.search - substring to match against name or phone number.
//         req.query.tags   - comma-separated tag names; contact must have ALL of them.
//         req.query.favoritesOnly - when "true", restricts results to favorites.
// Returns: JSON array of matching contacts sorted alphabetically by name.
async function listContacts(req, res) {
  const filter = {}

  if (req.query.search) {
    // Escape regex special characters in the user's input before building the pattern
    const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Case-insensitive match against contact name or any stored phone number
    const regex = new RegExp(escaped, 'i')
    filter.$or = [{ name: regex }, { 'phones.number': regex }]
  }

  if (req.query.tags) {
    // Split the comma-separated list, trim whitespace, and drop empty strings
    const tags = req.query.tags.split(',').map((t) => t.trim()).filter(Boolean)
    // $all requires the contact to have every specified tag, not just one
    if (tags.length) filter.tags = { $all: tags }
  }

  if (req.query.favoritesOnly === 'true') {
    filter.isFavorite = true
  }

  // collation with strength 2 makes the name sort case-insensitive (a == A)
  const contacts = await Contact.find(filter)
    .collation({ locale: 'en', strength: 2 })
    .sort({ name: 1 })
  res.json(contacts)
}

// Fetches a single contact by its MongoDB _id.
// Params: req.params.id - the contact's document ID.
// Returns: the matching contact as JSON, or throws a 404 error.
async function getContact(req, res) {
  const contact = await Contact.findById(req.params.id)
  if (!contact) throw notFound()
  res.json(contact)
}

// Creates a new contact document in the database.
// Params: req.body - object containing allowed CREATABLE_FIELDS values.
// Returns: the newly created contact as JSON with a 201 status and Location header.
async function createContact(req, res) {
  const body = pick(req.body || {}, CREATABLE_FIELDS)
  const contact = await Contact.create(body)
  res.status(201).location(`/api/contacts/${contact._id}`).json(contact)
}

// Updates an existing contact's editable fields.
// Params: req.params.id - the contact's document ID.
//         req.body      - object containing any subset of EDITABLE_FIELDS to change.
// Returns: the updated contact document as JSON, or throws a 404 error.
async function updateContact(req, res) {
  const updates = pick(req.body || {}, EDITABLE_FIELDS)
  // new: true returns the document after the update; runValidators enforces schema rules
  const contact = await Contact.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
  if (!contact) throw notFound()
  res.json(contact)
}

// Deletes a contact and removes its associated photo file from disk.
// Params: req.params.id - the contact's document ID.
// Returns: 204 No Content on success, or throws a 404 error.
async function deleteContact(req, res) {
  const contact = await Contact.findByIdAndDelete(req.params.id)
  if (!contact) throw notFound()
  // Clean up the photo file on disk after the DB record is removed
  await unlinkPhoto(contact.photo)
  res.status(204).end()
}

// Toggles the isFavorite flag on a contact.
// Params: req.params.id       - the contact's document ID.
//         req.body.isFavorite - boolean value to set (must be strictly boolean).
// Returns: the updated contact as JSON, or a 400 error if the value is invalid.
async function toggleFavorite(req, res) {
  // Guard: reject non-boolean values to prevent accidental type coercion
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

// Saves an uploaded photo for a contact and removes the previous photo from disk.
// Params: req.params.id - the contact's document ID.
//         req.file      - the uploaded file object provided by multer middleware.
// Returns: the updated contact as JSON. Cleans up the new file if any error occurs.
async function uploadPhoto(req, res) {
  if (!req.file) {
    const err = new Error('No file uploaded')
    err.status = 400
    throw err
  }

  const newFilename = req.file.filename

  try {
    const contact = await Contact.findById(req.params.id)
    if (!contact) throw notFound()

    const oldFilename = contact.photo
    contact.photo = newFilename
    await contact.save()

    // Delete the previous photo only after the DB save succeeds
    if (oldFilename) {
      await unlinkPhoto(oldFilename)
    }

    res.json(contact)
  } catch (err) {
    // If anything goes wrong, remove the newly uploaded file to avoid orphaned files
    await unlinkPhoto(newFilename).catch(() => {})
    throw err
  }
}

// Removes a contact's photo: clears the field in the DB and deletes the file from disk.
// Params: req.params.id - the contact's document ID.
// Returns: the updated contact as JSON, or a 404 error if the contact or photo is missing.
async function deletePhoto(req, res) {
  const contact = await Contact.findById(req.params.id)
  if (!contact) throw notFound()

  if (!contact.photo) {
    const err = new Error('Contact has no photo')
    err.status = 404
    throw err
  }

  const filename = contact.photo
  // Clear the photo reference in the DB before deleting from disk
  contact.photo = null
  await contact.save()

  await unlinkPhoto(filename)
  res.json(contact)
}

module.exports = {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  uploadPhoto,
  deletePhoto,
}
