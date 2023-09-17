const routes = require('express').Router({ mergeParams: true })
const job_routes = require('./jobs')
const prisma = require('../../../prisma')
const { createErrorResponse } = require('../../../utils/response')

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

const authorizeOrg = async (req, res, next) => {
    try {
        if (!req.params.org_id) {
            throw new Error('Invalid organization id.')
        }

        if (!req.params.contract_id) {
            throw new Error('Invalid contract id.')
        }

        const contract = await prisma.contract.findFirst({
            where: {
                id: req.params.contract_id,
                organizationId: req.params.org_id,
            },
        })

        if (!contract) {
            throw new Error('Contract not found.')
        }

        return next()
    } catch (error) {
        return res.status(403).json(createErrorResponse(error))
    }
}

/**
 * @api {get} /organizations/:org_id/contracts/ Get all contracts by organization
 */
routes.get('/', require('./getContracts'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id Get organization contract by id
 */
routes.get('/:contract_id', authorizeOrg, require('./getContractById'))

/**
 * @api {post} /organizations/:org_id/contracts/ Create organization contract
 */
routes.post('/', require('./createContract'))

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id Update organization contract
 */
routes.put('/:contract_id', authorizeOrg, require('./updateContract'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id Delete organization contract
 */
routes.delete('/:contract_id', authorizeOrg, require('./deleteContract'))

/*####################################Entry Routes END####################################################*/

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs Get all jobs by contract
 * @type {Router}
 */
routes.use('/:contract_id/jobs', authorizeOrg, job_routes)

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/comments Get all comments by contract
 * @type {Router}
 */
routes.use('/:contract_id/comments', authorizeOrg, require('./comments'))

module.exports = routes