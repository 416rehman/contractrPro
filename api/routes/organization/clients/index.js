const routes = require('express').Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/clients Get organization clients
 */
routes.get('/', require('./getClients'))

/**
 * @api {get} /organizations/:org_id/clients/:client_id Get organization client
 */
routes.get('/:client_id', require('./getClient'))

/**
 * @api {post} /organizations/:org_id/clients Add to organization
 */
routes.post('/', require('./createClient'))

/**
 * @api {put} /organizations/:org_id/clients/:client_id Update organization client
 */
routes.put('/:client_id', require('./updateClient'))

/**
 * @api {delete} /organizations/:org_id/clients/:client_id Remove from organization
 */
routes.delete('/:client_id', require('./deleteClient'))

/**
 * @api {use} /organizations/:org_id/clients/:client_id/comments Client comments
 */
routes.use('/:client_id/comments', require('./comments'))
module.exports = routes
