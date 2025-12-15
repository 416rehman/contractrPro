import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import { db, jobs, comments } from '../../../../../db';
import { updateCommentHandler } from '../../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/comments/{comment_id}:
 *   patch:
 *     summary: Update a job comment
 *     tags: [JobComments]
 *     responses:
 *       200:
 *         description: Comment updated
 */
export default updateCommentHandler({
    resourceTable: jobs,
    dbQueryKey: 'jobs',
    resourceIdParam: 'job_id',
    foreignKeyField: 'jobId'
});
