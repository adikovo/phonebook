/*
 * ============================================================
 * tagsController.js
 * Express controller for tag-related operations.
 * Provides a single endpoint that returns all unique tag
 * values currently assigned across every contact document.
 * ============================================================
 */

const Contact = require('../models/Contact')

// Returns a sorted list of all unique, non-empty tags used across contacts.
// distinct() performs the deduplication at the DB level; results are then
// filtered for safety and sorted alphabetically for consistent UI ordering.
async function listTags(req, res) {
  // DB-level deduplication — returns one entry per unique value in the tags field
  const tags = await Contact.distinct('tags')

  // Filter out any non-string or empty values that may have been stored accidentally
  const clean = tags.filter((t) => typeof t === 'string' && t.length > 0)

  // Locale-aware sort for consistent A-Z ordering across accented characters
  clean.sort((a, b) => a.localeCompare(b))

  res.json(clean)
}

module.exports = { listTags }
