const path = require('path')
const multer = require('multer')

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${req.params.id}-${Date.now()}${ext}`)
  },
})

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(null, true)
  }
  const err = new Error('Unsupported file type. Allowed: jpeg, png, webp, gif')
  err.status = 400
  cb(err)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
})

module.exports = upload
