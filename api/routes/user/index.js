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
 * @api {use} /me Get the current user
 */
routes.use('/me', require('./me'))

/**
 * @api {get} /users/:user_id Get a user by id
 */
routes.get('/:user_id', require('./me/getUser'))

/**
 * @api {get} /users/:user_id/organizations Get organizations of a user
 */
routes.get('/:user_id/organizations', require('./getUserOrganizations'))

/**
 * @api {delete} /users/:user_id/organizations/:org_id leave the organization
 */
routes.delete('/:user_id/organizations/:org_id', require('./leaveOrganization'))

/**
 * @api {post} /user/:user_id/email Change the user's email address - sends a verification token to the new email
 * Once the user verifies the new email in the /auth/verify route, the email will be changed
 */
routes.post('/:user_id/email', require('./me/changeEmail'))

module.exports = routes