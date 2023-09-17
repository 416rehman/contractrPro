const { createErrorResponse } = require('../../../utils/response')
const routes = require('express').Router({ mergeParams: true })
const prisma = require('../../../prisma')

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

const authorizeOrg = async (req, res, next) => {
    try {
        // Makes sure the client belongs to the organization
        const clientId = req.params.client_id
        const orgId = req.params.org_id

        if (!clientId) {
            throw new Error('Invalid client id.')
        }

        if (!orgId) {
            throw new Error('Invalid organization id.')
        }

        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                organizationId: orgId,
            },
        })

        if (!client) {
            throw new Error('Client not found.')
        }

        return next()
    } catch (error) {
        return res.status(403).json(createErrorResponse(error))
    }
}

/**
 * @api {get} /organizations/:org_id/clients Get organization clients
 */
routes.get('/', require('./getClients'))

/**
 * @api {get} /organizations/:org_id/clients/:client_id Get organization client
 */
routes.get('/:client_id', authorizeOrg, require('./getClient'))

/**
 * @api {post} /organizations/:org_id/clients Add to organization
 */
routes.post('/', require('./createClient'))

/**
 * @api {put} /organizations/:org_id/clients/:client_id Update organization client
 */
routes.put('/:client_id', authorizeOrg, require('./updateClient'))

/**
 * @api {delete} /organizations/:org_id/clients/:client_id Remove from organization
 */
routes.delete('/:client_id', authorizeOrg, require('./deleteClient'))

/**
 * @api {use} /organizations/:org_id/clients/:client_id/comments Client comments
 */
routes.use('/:client_id/comments', authorizeOrg, require('./comments'))
module.exports = routes