const {
    ValidationErrorsHandler,
} = require('../../middleware/validationMiddleware')
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
 * @api {post} /auth/login Gets the user's refresh token
 * @apiName Login
 */
routes.post(
    '/login',
    GetAccountTokenValidator,
    ValidationErrorsHandler,
    require('./postLogin')
)

/**
 * @api {post} /auth/ Use refresh token to get new access token
 * @apiName GetAccountToken
 */
routes.post('/token', require('./getAccessToken'))

/**
 * @api {post} /auth/account Register new account
 * @apiName RegisterAccount
 */
routes.post(
    '/account',
    RegisterAccountValidator,
    ValidationErrorsHandler,
    require('./postAccount')
)

/**
 * @api {delete} /auth/account Delete account
 * @apiName DeleteAccount
 */
routes.delete('/account', checkAuth, require('./deleteAccount'))

/**
 * @api {post} /auth/logout Logout - Clears the cookie if it exists
 * @apiName Logout
 */
routes.post('/logout', require('./logout'))

/**
 * @api {post} /auth/forgot Sends a password reset token to the user's email
 */
routes.post('/forgot', require('./forgot'))

module.exports = routes