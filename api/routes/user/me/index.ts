import getUser from './getUser';
import changeEmail from './changeEmail';
import changePhone from './changePhone';
import changeAvatar from './changeAvatar';
import changeName from './changeName';
import { Router } from 'express';
const routes = Router();

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /me Get the current signedInUser
 */
routes.post('/', getUser)

/**
 * @api {post} /me/email Change the signedInUser's email address - sends a verification token to the new email
 * Once the signedInUser verifies the new email in the /confirm route, the email will be changed
 */
routes.post('/email', changeEmail)

/**
 * @api {post} /me/phone Change the signedInUser's phone number - sends a verification token to the new phone number
 * Once the signedInUser verifies the new phone number in the /confirm route, the phone number will be changed
 */
routes.post('/phone', changePhone)

/**
 * @api {post} /me/password Change the signedInUser's avatarUrl
 */
routes.post('/avatar', changeAvatar)

/**
 * @api {post} /me/name Change the signedInUser's name
 */
routes.post('/name', changeName)

export default routes
