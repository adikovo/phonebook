const mongoose = require('mongoose')

const PHONE_NUMBER_REGEX = /^[0-9+\-\s]{3,25}$/

const PhoneEntrySchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, 'phones[].number is required'],
      trim: true,
      match: [PHONE_NUMBER_REGEX, 'phones[].number must be 3-25 characters and contain only digits, +, -, or spaces'],
    },
    label: {
      type: String,
      required: [true, 'phones[].label is required'],
      trim: true,
      minlength: [1, 'phones[].label is required'],
      maxlength: [20, 'phones[].label must be 20 characters or fewer'],
    },
  },
  { _id: true }
)

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      minlength: [1, 'name is required'],
      maxlength: [100, 'name must be 100 characters or fewer'],
    },
    phones: {
      type: [PhoneEntrySchema],
      validate: [
        {
          validator: (arr) => Array.isArray(arr) && arr.length >= 1,
          message: 'phones must contain at least 1 entry',
        },
        {
          validator: (arr) => arr.length <= 10,
          message: 'phones cannot have more than 10 entries',
        },
      ],
    },
    birthday: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
      maxlength: [2000, 'notes must be 2000 characters or fewer'],
    },
    photo: {
      type: String,
      default: null,
    },
    tags: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [1, 'tag cannot be empty'],
          maxlength: [30, 'tag must be 30 characters or fewer'],
        },
      ],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'cannot assign more than 20 tags to one contact',
      },
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

ContactSchema.index({ name: 1 })
ContactSchema.index({ tags: 1 })
ContactSchema.index({ isFavorite: 1 })

module.exports = mongoose.model('Contact', ContactSchema)
