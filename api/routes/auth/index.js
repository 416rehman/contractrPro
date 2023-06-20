const {
    ValidationErrorsHandler,
} = require('../../middleware/validationMiddleware')
const whitelistFields = require('../../middleware/whitelistFieldsMiddleware')
const checkAuth = require('../../middleware/authMiddleware')
const {
    GetAccountTokenValidator,
    RegisterAccountValidator,
} = require('../../validators/auth-validator')
const routes = require('express').Router()

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {post} /auth/login Gets the user's opaque refresh token
 * @apiName Login
 */
routes.post(
    '/login',
    GetAccountTokenValidator,
    ValidationErrorsHandler,
    require('./postLogin')
)

/**
 * @api {get} /auth/ Get account token via refresh token
 * @apiName GetAccountToken
 */
routes.get('/token', require('./getToken'))

/**
 * @api {post} /auth/account Register new account
 * @apiName RegisterAccount
 */
routes.post(
    '/account',
    whitelistFields(['username', 'password', 'email', 'name', 'phone', 'avatarUrl']),
    RegisterAccountValidator,
    ValidationErrorsHandler,
    require('./postAccount')
)

/**
 * @api {delete} /auth/account Delete account
 * @apiName DeleteAccount
 */
routes.delete('/account', checkAuth, require('./deleteAccount'))

module.exports = routes
