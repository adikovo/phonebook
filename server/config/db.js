/*
 * ============================================
 * server/config/db.js
 * Handles the MongoDB connection using Mongoose.
 * Reads the connection URI from the MONGODB_URI
 * environment variable and exports connectDB().
 * ============================================
 */

const mongoose = require('mongoose')

// Connects to MongoDB using the URI from the environment.
// Throws an error if MONGODB_URI is not set, or if the connection fails.
async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill in your password.')
  }
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')
}

module.exports = { connectDB }
