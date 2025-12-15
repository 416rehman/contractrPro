import getJobMembers from './getJobMembers';
import getJobMember from './getJobMember';
import createJobMember from './createJobMember';
import deleteJobMember from './deleteJobMember';
import updateJobMember from './updateJobMember';
import { Router } from 'express';
const routes = Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Get organization contract job members
 */
routes.get('/', getJobMembers)

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members/:member_id Get organization contract job member
 */
routes.get('/:member_id', getJobMember)

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Add member to organization contract job
 */
routes.post('/', createJobMember)

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Remove member from organization contract job
 */
routes.delete('/:member_id', deleteJobMember)

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members/:member_id Update organization contract job member
 */
routes.put('/:member_id', updateJobMember)

export default routes
