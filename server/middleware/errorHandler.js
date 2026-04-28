function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  if (err.name === 'ValidationError') {
    const firstField = Object.keys(err.errors)[0]
    const message = firstField ? err.errors[firstField].message : 'Validation failed'
    return res.status(400).json({ error: message })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}` })
  }

  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message })
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

module.exports = errorHandler
