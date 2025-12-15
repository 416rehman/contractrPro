import getContractMembers from './getContractMembers';
import getContractMember from './getContractMember';
import createContractMember from './createContractMember';
import updateContractMember from './updateContractMember';
import deleteContractMember from './deleteContractMember';
import { Router } from 'express';
const routes = Router({ mergeParams: true })

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/members Get all members by contract
 */
routes.get('/', getContractMembers)

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/members/:member_id Get contract member by id
 */
routes.get('/:member_id', getContractMember)

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/members Create contract member
 */
routes.post('/', createContractMember)

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/members/:member_id Update contract member
 */
routes.put('/:member_id', updateContractMember)

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/members/:member_id Delete contract member
 */
routes.delete('/:member_id', deleteContractMember)

export default routes
