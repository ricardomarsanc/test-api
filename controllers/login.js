const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const loginRouter = require('express').Router()
const User = require('../models/User')

loginRouter.post('/', async (req, res, next) => {
  const { body } = req
  const { username, password } = body

  const user = await User.findOne({ username })
  const passCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passCorrect)) {
    res.status(401).json({
      error: 'Incorrect username or password'
    })
  }

  const userForToken = {
    id: user._id,
    username: user.username
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  try {
    res.send({
      name: user.name,
      username: user.username,
      token
    })
  } catch (e) {
    next(e)
  }
})

module.exports = loginRouter
