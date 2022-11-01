const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')

usersRouter.get('/', async (req, res, next) => {
  /** Populate will "populate" the object described (in this case, notes)
   * with the data of the Object described as reference in the model.
   * By default, it will throw all the elements of the particular object,
   * but you can specify which parameters you want to receive.
   *
   * This is similar to a Database JOIN but without blocking read/write
   * permissions on the "tables" (models), meaning that is non-transactional
  */
  const users = await User.find({}).populate('notes', {
    content: 1,
    date: 1,
    important: 1
  })
  res.json(users)
})

usersRouter.post('/', async (req, res, next) => {
  const { body } = req
  const { username, name, password } = body

  const passwordHash = await bcrypt.hash(password, 10)

  const user = new User({
    username,
    name,
    passwordHash
  })

  try {
    const savedUser = await user.save()
    res.status(201).json(savedUser)
  } catch (e) {
    console.error(e)
    res.status(400).json(e)
  }
})

module.exports = usersRouter
