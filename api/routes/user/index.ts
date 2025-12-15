import getUsers from './getUsers';
import me from './me';
import getUser from './me/getUser';
import getUserWithOrganizations from './getUserWithOrganizations';
import leaveOrganization from './leaveOrganization';
import meHandler from '../../middleware/meHandler';
import { Router } from 'express';
const routes = Router();

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /users Get all users
 */
routes.get('/', getUsers)

/**
 * @api {use} /me Get the current signedInUser
 */
routes.use('/me', me)

/**
 * @api {get} /users/:user_id Get a signedInUser by id
 */
routes.get('/:user_id', meHandler, getUser)

/**
 * @api {get} /users/:user_id/organizations Get organizations of a signedInUser
 */
routes.get(
    '/:user_id/organizations',
    meHandler,
    getUserWithOrganizations
)

/**
 * @api {delete} /users/:user_id/organizations/:org_id leave the organization
 */
routes.delete(
    '/:user_id/organizations/:org_id',
    meHandler,
    leaveOrganization
)

export default routes
