import { validate } from '../../middleware/validation';
import postLogin from './postLogin';
import token from './token';
import logout from './logout';
import forgot from './forgot';
import resetPassword from './resetPassword';
import verifyEmail from './verifyEmail';
import verifyPhone from './verifyPhone';
import account from './account';
import { authLimiter, tokenLimiter } from '../../middleware/rateLimit';
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
    authLimiter,
    validate(postLogin.schema),
    postLogin.handler
)

/**
 * @api {post} /auth/ Use refresh token to get new access token
 * @apiName GetAccountToken
 */
routes.post('/token', tokenLimiter, token)

/**
 * @api {post} /auth/reset-password Reset password
 * @apiName ResetPassword
 */
routes.post(
    '/reset-password',
    authLimiter,
    validate(resetPassword.schema),
    resetPassword.handler
)

/**
 * @api {post} /auth/verify/email Verify Email
 * @apiName VerifyEmail
 */
routes.post(
    '/verify/email',
    authLimiter,
    validate(verifyEmail.schema),
    verifyEmail.handler
)

/**
 * @api {post} /auth/verify/phone Verify Phone
 * @apiName VerifyPhone
 */
routes.post(
    '/verify/phone',
    authLimiter,
    validate(verifyPhone.schema),
    verifyPhone.handler
)

/**
 * @api {post} /auth/logout Logout - Clears the cookie if it exists
 * @apiName Logout
 */
routes.post('/logout', logout)

/**
 * @api {post} /auth/forgot Sends a password reset token to the signedInUser's email
 */
routes.post(
    '/forgot',
    authLimiter,
    validate(forgot.schema),
    forgot.handler
)

/**
 * @api {use} /auth/account Uses the account router
 */
routes.use(
    '/account',
    account
)

export default routes
