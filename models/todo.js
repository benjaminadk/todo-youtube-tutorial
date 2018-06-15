const mongoose = require('mongoose')
const Schema = mongoose.Schema
const keys = require('../config/dev.js')

mongoose.connect(
  keys.MLAB_KEY,
  () => console.log('Connected to MLab')
)

const todoSchema = new Schema({
  text: String,
  complete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

mongoose.model('todo', todoSchema)
