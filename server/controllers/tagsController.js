const Contact = require('../models/Contact')

async function listTags(req, res) {
  const tags = await Contact.distinct('tags')
  tags.sort((a, b) => a.localeCompare(b))
  res.json(tags)
}

module.exports = { listTags }
