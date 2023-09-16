const routes = require('express').Router({ mergeParams: true })

routes.get('/:blob_id', require('./getBlob'))

module.exports = routes
