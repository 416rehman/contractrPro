const routes = require('express').Router()

// /admin/users - Retrieves all users in the system
routes.get('/users', require('./getUsers'))

// /admin/organizations - Retrieves all organizations in the system
routes.get('/organizations', require('./getOrganizations'))

// /admin/users
routes.put('/users', require('./updateUsers'))

module.exports = routes