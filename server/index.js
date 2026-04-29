/*
 * ============================================
 * server/index.js
 * Entry point for the Express server.
 * Loads environment variables, connects to
 * MongoDB, registers middleware and routes,
 * then starts listening for HTTP requests.
 * ============================================
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const path = require('path')
const express = require('express')
const cors = require('cors')

const { connectDB } = require('./config/db')
const errorHandler = require('./middleware/errorHandler')
const contactsRouter = require('./routes/contacts')
const tagsRouter = require('./routes/tags')

const app = express()

// Allow cross-origin requests (needed for the Vite dev server on a different port)
app.use(cors())
app.use(express.json())

// Serve uploaded contact photos as static files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/contacts', contactsRouter)
app.use('/api/tags', tagsRouter)

// Global error handler — must be registered after all routes
app.use(errorHandler)

const PORT = process.env.PORT || 4000

// Only start listening once the database connection is established
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
