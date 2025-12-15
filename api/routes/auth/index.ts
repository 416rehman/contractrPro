import postLogin from './postLogin';
import token from './token';
import postAccount from './postAccount';
import deleteAccount from './deleteAccount';
import logout from './logout';
import forgot from './forgot';
import { ValidationErrorsHandler,
 } from '../../middleware/validationMiddleware';
import checkAuth from '../../middleware/authMiddleware';
import { GetAccountTokenValidator,
    RegisterAccountValidator,
 } from '../../validators/auth-validator';
import { Router } from 'express';
const routes = Router();

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {post} /auth/login Gets the signedInUser's refresh token
 * @apiName Login
 */
routes.post(
    '/login',
    GetAccountTokenValidator,
    ValidationErrorsHandler,
    postLogin
)

/**
 * @api {post} /auth/ Use refresh token to get new access token
 * @apiName GetAccountToken
 */
routes.post('/token', token)

/**
 * @api {post} /auth/account Register new account
 * @apiName RegisterAccount
 */
routes.post(
    '/account',
    RegisterAccountValidator,
    ValidationErrorsHandler,
    postAccount
)

/**
 * @api {delete} /auth/account Delete account
 * @apiName DeleteAccount
 */
routes.delete('/account', checkAuth, deleteAccount)

/**
 * @api {get} /auth/logout Logout - Clears the cookie if it exists
 * @apiName Logout
 */
routes.get('/logout', logout)

/**
 * @api {post} /auth/forgot Sends a password reset token to the signedInUser's email
 */
routes.post('/forgot', forgot)

export default routes
