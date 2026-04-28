const express = require('express')
const {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
} = require('../controllers/contactsController')

const router = express.Router()

router.get('/', listContacts)
router.get('/:id', getContact)
router.post('/', createContact)
router.put('/:id', updateContact)
router.delete('/:id', deleteContact)
router.patch('/:id/favorite', toggleFavorite)

module.exports = router
