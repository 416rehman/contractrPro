import { db, jobs } from '../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs:
 *   get:
 *     summary: Get all jobs for a contract
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs
 */
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (!contractID || !isValidUUID(contractID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const jobList = await db.query.jobs.findMany({
            where: and(
                eq(jobs.contractId, contractID),
                eq(jobs.organizationId, orgID)
            ),
            with: { contract: true }
        })

        return res.status(200).json(createSuccessResponse(jobList))
    } catch (error) {
        res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

