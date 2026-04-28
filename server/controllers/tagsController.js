const Contact = require('../models/Contact')

async function listTags(req, res) {
  const tags = await Contact.distinct('tags')
  const clean = tags.filter((t) => typeof t === 'string' && t.length > 0)
  clean.sort((a, b) => a.localeCompare(b))
  res.json(clean)
}

module.exports = { listTags }
