const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const { server } = require('../index')
const User = require('../models/User')

const { api, getAllUsers } = require('./helpers')

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('pswd', 10)
  const user = new User({ username: 'ricmart_root', name: 'RicardoRoot', passwordHash })
  await user.save()
})

test('create new user', async () => {
  const usersDB = await User.find({})
  const usersAtStart = usersDB.map(user => user.toJSON())
  const newUser = {
    username: 'ricmart',
    name: 'Ricardo',
    password: 'Xample'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await getAllUsers()

  expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
})

test('creation fails with proper statuscode and message if username is already taken', async () => {
  const usersAtStart = await getAllUsers()

  const newUser = {
    username: 'ricmart_root',
    name: 'Ricardo Root',
    password: 'testpass'
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  expect(result.body.errors.username.message).toContain('`username` to be unique')

  const usersAtEnd = await getAllUsers()

  expect(usersAtEnd).toHaveLength(usersAtStart.length)
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
