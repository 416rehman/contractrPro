const routes = require('express').Router()

// /admin/users - Retrieves all users in the system
routes.get('/users', require('./getUsers'))

// /admin/organizations - Retrieves all organizations in the system
routes.get('/organizations', require('./getOrganizations'))
module.exports = routes
