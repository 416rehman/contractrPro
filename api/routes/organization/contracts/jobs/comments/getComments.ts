import { jobs } from '../../../../../db';
import { getCommentsHandler } from '../../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/comments:
 *   get:
 *     summary: Get comments for a job
 *     tags: [JobComments]
 *     responses:
 *       200:
 *         description: List of comments
 */
export default getCommentsHandler({
    resourceTable: jobs,
    dbQueryKey: 'jobs',
    resourceIdParam: 'job_id',
    foreignKeyField: 'jobId'
});
