module.exports = (error, _req, response, _n) => {
  console.error(error)

  if (error.name === 'CastError') {
    response.status(400).end()
  } else {
    response.status(500).end()
  }
}
