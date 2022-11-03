const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const auth = req.get('authorization')

  let token = ''
  if (auth && auth.toLowerCase().startsWith('bearer')) {
    token = auth.substring(7)
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!decodedToken || !decodedToken.id) {
    return res.status(401).json({ error: 'Token missing or invalid' })
  }

  const { id: userId } = decodedToken
  req.userId = userId
  next()
}
