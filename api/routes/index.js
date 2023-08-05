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
routes.post('/confirm', require('./confirm'))

routes.use('/users', checkAuth, require('./user'))
routes.use('/organizations', checkAuth, require('./organization'))
routes.use('/join', checkAuth, require('./join'))

routes.use('/admin', adminMiddleware, require('./admin'))

module.exports = routes
