const express = require('express')
const upload = require('../middleware/upload')
const {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  uploadPhoto,
  deletePhoto,
} = require('../controllers/contactsController')

const router = express.Router()

router.get('/', listContacts)
router.get('/:id', getContact)
router.post('/', createContact)
router.put('/:id', updateContact)
router.delete('/:id', deleteContact)
router.patch('/:id/favorite', toggleFavorite)
router.post('/:id/photo', upload.single('photo'), uploadPhoto)
router.delete('/:id/photo', deletePhoto)

module.exports = router
