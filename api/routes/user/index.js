const routes = require('express').Router()

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

routes.get('/', require('./getUsers'))

routes.get('/:user_id', require('./getUser'))

/**
 * @api {post} /user/:user_id/organizations Get organizations of a user
 */
routes.get('/:user_id/organizations', require('./getUserOrganizations'))

/**
 * @api {delete} /user/:user_id/organizations/:org_id leave the organization
 */
routes.delete('/:user_id/organizations/:org_id', require('./leaveOrganization'))

module.exports = routes
