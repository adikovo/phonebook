const express = require('express')
const { listTags } = require('../controllers/tagsController')

const router = express.Router()

router.get('/', listTags)

module.exports = router
