require('dotenv').config()
const mongoose = require('mongoose')

const { MONGODB_URI, MONGODB_URI_TEST, NODE_ENV } = process.env

const connectionString = NODE_ENV === 'test'
  ? MONGODB_URI_TEST
  : MONGODB_URI

// comment for students puposes
if (!connectionString) {
  console.error('Recuerda que tienes que tener un archivo .env con las variables de entorno definidas y el MONGO_DB_URI que servirá de connection string. En las clases usamos MongoDB Atlas pero puedes usar cualquier base de datos de MongoDB (local incluso).')
}

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(() => {
    console.log('Database connected')
  }).catch((e) => {
    console.log('Error: ', e)
  })

process.on('uncaughtException', error => {
  console.error(error)
  mongoose.disconnect()
})
