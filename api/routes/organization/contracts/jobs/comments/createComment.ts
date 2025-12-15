import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import UUID from 'uuid';
import { pick } from '../../../../../utils';
import { db, comments, attachments, jobs, contracts } from '../../../../../db';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import s3 from '../../../../../utils/s3';
import { eq, and } from 'drizzle-orm';
import { createCommentHandler } from '../../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/comments:
 *   post:
 *     summary: Create a comment on a job
 *     tags: [JobComments]
 *     responses:
 *       200:
 *         description: Comment created
 */
export default createCommentHandler({
    resourceTable: jobs,
    dbQueryKey: 'jobs',
    resourceIdParam: 'job_id',
    foreignKeyField: 'jobId'
});
