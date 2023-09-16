const routes = require('express').Router({ mergeParams: true })

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/members Get all members by contract
 */
routes.get('/', require('./getContractMembers'))

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/members/:member_id Get contract member by id
 */
routes.get('/:member_id', require('./getContractMember'))

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/members Create contract member
 */
routes.post('/', require('./createContractMember'))

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/members/:member_id Update contract member
 */
routes.put('/:member_id', require('./updateContractMember'))

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/members/:member_id Delete contract member
 */
routes.delete('/:member_id', require('./deleteContractMember'))

module.exports = routes
