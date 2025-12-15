import { jobs } from '../../../../../db';
import { deleteCommentHandler } from '../../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete a job comment
 *     tags: [JobComments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default deleteCommentHandler({
    resourceTable: jobs,
    dbQueryKey: 'jobs',
    resourceIdParam: 'job_id',
    foreignKeyField: 'jobId'
});
