const organization_service = require('../../services/organization-service')
const {AuditLogHandler} = require('../../middleware/organization-middleware')
const routes = require('express').Router({mergeParams: true });
const contract_router = require('./contracts/contract-routes')
const member_router = require('./members/members-routes')
const invite_router = require('./invites/invites-routes')

routes.use((req, res, next) => {
    const path = (__filename.split('/').slice(-1)[0]).split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id Get organization by id
 */
routes.get('/:org_id', (req, res) => {
    res.send('Not implemented')
});

/**
 * @api {post} /organizations/ Create organization
 */
routes.post('/', (req, res) => {
    organization_service.create(req, res)
});


/**
 * @api {delete} /organizations/:org_id Delete organization
 */
routes.delete('/:org_id', (req, res) => {

});

/**
 * @api {put} /organizations/:org_id Update organization
 */
routes.put('/:org_id', (req, res) => {

});

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

module.exports = routes;