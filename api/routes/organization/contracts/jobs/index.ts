import getJobs from './getJobs';
import getJob from './getJob';
import postJob from './postJob';
import updateJob from './updateJob';
import deleteJob from './deleteJob';
import jobMembers from './jobMembers';
import comments from './comments';
import { Router } from 'express';
const routes = Router({ mergeParams: true })

routes.use((req, res, next) => {
    const path = __filename.split('/').slice(-1)[0].split('\\').slice(-1)[0]
    res.set('Router', path)
    next()
})

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs Get all organization contract jobs
 */
routes.get('/', getJobs)

/**
 * @api {get} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Get organization contract job
 */
routes.get('/:job_id', getJob)

/**
 * @api {post} /organizations/:org_id/contracts/:contract_id/jobs Create organization contract job
 */
routes.post('/', postJob)

/**
 * @api {put} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Update organization contract job
 */
routes.put('/:job_id', updateJob)

/**
 * @api {delete} /organizations/:org_id/contracts/:contract_id/jobs/:job_id Delete organization contract job
 */
routes.delete('/:job_id', deleteJob)

/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/members Job members
 **/
routes.use('/:job_id/members', jobMembers)

/**
 * @api {use} /organizations/:org_id/contracts/:contract_id/jobs/:job_id/comments Job comments
 */
routes.use('/:job_id/comments', comments)

export default routes
