import { db, organizationMembers, jobMembers, jobs } from '../../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/members:
 *   get:
 *     summary: Get all members for a job
 *     tags: [JobMembers]
 *     responses:
 *       200:
 *         description: List of job members
 */
export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }
        if (!contractId || !isValidUUID(contractId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const jobValid = await db.query.jobs.findFirst({
            where: and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractId),
                eq(jobs.organizationId, orgId)
            )
        });

        if (!jobValid) {
            return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        const membersWithJobs = await db.query.organizationMembers.findMany({
            where: eq(organizationMembers.organizationId, orgId),
            with: {
                jobMembers: {
                    where: eq(jobMembers.jobId, jobId),
                    with: { job: true }
                }
            }
        });

        const filtered = membersWithJobs.filter(m => m.jobMembers && m.jobMembers.length > 0);

        return res.status(200).json(createSuccessResponse(filtered))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

