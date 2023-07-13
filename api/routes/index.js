const checkAuth = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')
const { createSuccessResponse } = require('../utils/response')
const routes = require('express').Router()

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

routes.get('/', (req, res) => {
    res.json(createSuccessResponse('Connected'))
})

routes.use('/auth', require('./auth'))
routes.post('/verify', require('./verify'))

routes.use(checkAuth) // WARNING: All routes below this line require authentication
routes.use('/users', require('./user'))
routes.use('/organizations', require('./organization'))
routes.use('/join', require('./join'))

routes.use(adminMiddleware) // WARNING: All routes below this line require ADMIN flag to be set
routes.use('/admin', adminMiddleware, require('./admin'))

module.exports = routes