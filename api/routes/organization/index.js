const routes = require('express').Router({ mergeParams: true })
const contract_router = require('./contracts')
const member_router = require('./members')
const invite_router = require('./invites')

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id Get organization by id
 */
routes.get('/:org_id', require('./getOrganization'))

/**
 * @api {post} /organizations/ Create organization
 */
routes.post(
    '/',
    require('./postOrganization')
)

/**
 * @api {delete} /organizations/:org_id Delete organization
 */
routes.delete('/:org_id', require('./deleteOrganization'))

/**
 * @api {put} /organizations/:org_id Update organization
 */
routes.put(
    '/:org_id',
    require('./putOrganization')
)

/**
 * @api {get} /organizations/:org_id/members Uses the organization's member router
 */
routes.use('/:org_id/members', member_router)

/**
 * @api {get} /organizations/:org_id/invites Uses the organization's invite router
 */
routes.use('/:org_id/invites', invite_router)

/**
 * @api {use} /organizations/:org_id/contracts Uses the organization's contracts router
 */
routes.use('/:org_id/contracts', contract_router)

module.exports = routes
