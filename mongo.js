require('dotenv').config()
const mongoose = require('mongoose')

const connectionString = process.env.MONGODB_URI

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Database connected')
  }).catch((e) => {
    console.log('Error: ', e)
  })

process.on('uncaughtException', () => {
  mongoose.connection.disconnect()
})
