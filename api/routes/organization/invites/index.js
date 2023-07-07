const routes = require('express').Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/invites Get organization invites
 */
routes.get('/', require('./getOrganizationInvites'))

/**
 * @api {get} /organizations/:org_id/invites/:invite_id Get organization invite
 */
routes.get('/:invite_id', require('./getOrganizationInvite'))

/**
 * @api {post} /organizations/:org_id/invites Create organization invite
 */
routes.post('/', require('./createOrganizationInvite'))

/**
 * @api {delete} /organizations/:org_id/invites/:invite_id Delete organization invite
 */
routes.delete('/:invite_id', require('./deleteOrganizationInvite'))

module.exports = routes
