const meHandler = require('../../middleware/meHandler')
const routes = require('express').Router()

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /users Get all users
 */
routes.get('/', require('./getUsers'))

/**
 * @api {use} /me Get the current signedInUser
 */
routes.use('/me', require('./me'))

/**
 * @api {get} /users/:user_id Get a signedInUser by id
 */
routes.get('/:user_id', meHandler, require('./me/getUser'))

/**
 * @api {get} /users/:user_id/organizations Get organizations of a signedInUser
 */
routes.get(
    '/:user_id/organizations',
    meHandler,
    require('./getUserOrganizations')
)

/**
 * @api {delete} /users/:user_id/organizations/:org_id leave the organization
 */
routes.delete(
    '/:user_id/organizations/:org_id',
    meHandler,
    require('./leaveOrganization')
)

module.exports = routes
