import { Router } from 'express';
import { authLimiter } from '../../../middleware/rateLimit';
import postAccount from './postAccount';
import postDeleteToken from './postDeletionToken';
import deleteAccount from './postDelete';
import checkAuth from '../../../middleware/authMiddleware';
import { validate } from '../../../middleware/validation';
const routes = Router();

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {post} /auth/account Register new account
 * @apiName RegisterAccount
 */
routes.post(
    '/',
    authLimiter,
    validate(postAccount.schema),
    postAccount.handler
)

/**
 * @api {post} /auth/account/request-delete Request account deletion token
 * @apiName RequestDeleteToken
 */
routes.post(
    '/request-delete',
    authLimiter,
    checkAuth,
    postDeleteToken.handler
)

/**
 * @api {post} /auth/account/delete Delete account (Confirmed)
 * @apiName DeleteAccount
 */
routes.post(
    '/delete',
    authLimiter,
    checkAuth,
    validate(deleteAccount.schema),
    deleteAccount.handler
)

export default routes
