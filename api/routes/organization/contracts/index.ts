import getContracts from './getContracts';
import getContractById from './getContractById';
import createContract from './createContract';
import updateContract from './updateContract';
import deleteContract from './deleteContract';
import contractMembers from './contractMembers';
import comments from './comments';
import { Router } from 'express';
import { authorizeOrg } from '../../../middleware/permissions';
import { OrgPermissions } from '../../../db/flags';

const routes = Router({ mergeParams: true })
import job_routes from './jobs';

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/ Get all contracts by organization
 */
routes.get('/', getContracts)

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id Get organization contract by id
 */
routes.get('/:contract_id', getContractById)

/**
 * @api {post} /organizations/:org_id/contracts/ Create organization contract
 */
routes.post('/', authorizeOrg(OrgPermissions.MANAGE_CONTRACTS), createContract)

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id Update organization contract
 */
routes.put('/:contract_id', authorizeOrg(OrgPermissions.MANAGE_CONTRACTS), updateContract)

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id Delete organization contract
 */
routes.delete('/:contract_id', authorizeOrg(OrgPermissions.MANAGE_CONTRACTS), deleteContract)

/*####################################Entry Routes END####################################################*/

/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/members Get all members by contract
 */
routes.use('/:contract_id/members', contractMembers)

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs Get all jobs by contract
 * @type {Router}
 */
routes.use('/:contract_id/jobs', job_routes)

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/comments Get all comments by contract
 * @type {Router}
 */
routes.use('/:contract_id/comments', comments)

export default routes
