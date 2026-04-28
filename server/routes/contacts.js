const express = require('express')

const router = express.Router()

// Stub: real CRUD endpoints land in T020-T022, T040-T041, T049-T051.
router.get('/', (req, res) => {
  res.json([])
})

module.exports = router
