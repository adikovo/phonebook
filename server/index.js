require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const path = require('path')
const express = require('express')
const cors = require('cors')

const { connectDB } = require('./config/db')
const contactsRouter = require('./routes/contacts')
const tagsRouter = require('./routes/tags')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/contacts', contactsRouter)
app.use('/api/tags', tagsRouter)

// Temporary inline error handler — replaced by middleware/errorHandler.js in T011.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 4000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  })
