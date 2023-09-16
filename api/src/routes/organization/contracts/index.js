const routes = require('express').Router({ mergeParams: true })
const job_routes = require('./jobs')

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/ Get all contracts by organization
 */
routes.get('/', require('./getContracts'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id Get organization contract by id
 */
routes.get('/:contract_id', require('./getContractById'))

/**
 * @api {post} /organizations/:org_id/contracts/ Create organization contract
 */
routes.post('/', require('./createContract'))

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id Update organization contract
 */
routes.put('/:contract_id', require('./updateContract'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id Delete organization contract
 */
routes.delete('/:contract_id', require('./deleteContract'))

/*####################################Entry Routes END####################################################*/

/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/members Get all members by contract
 */
routes.use('/:contract_id/members', require('./contractMembers'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs Get all jobs by contract
 * @type {Router}
 */
routes.use('/:contract_id/jobs', job_routes)

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/comments Get all comments by contract
 * @type {Router}
 */
routes.use('/:contract_id/comments', require('./comments'))

module.exports = routes
