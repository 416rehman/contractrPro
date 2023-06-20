const routes = require('express').Router()

// /admin/users - Retrieves all users in the system
routes.get('/users', require('./getUsers'))

module.exports = routes
