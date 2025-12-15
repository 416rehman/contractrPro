import { db, jobs } from '../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}:
 *   patch:
 *     summary: Update a job
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Job updated
 */
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id
        const jobId = req.params.job_id

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (!contractID || !isValidUUID(contractID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const body = {
            ...pick(req.body, ['identifier', 'name', 'description', 'status']),
            contractId: contractID,
            organizationId: orgID,
            updatedByUserId: req.auth.id,
        }

        const [updatedJob] = await db.update(jobs)
            .set(body)
            .where(and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractID),
                eq(jobs.organizationId, orgID)
            ))
            .returning();

        if (!updatedJob) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(updatedJob))
    } catch (error) {
        res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

