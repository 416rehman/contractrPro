import { db, organizationMembers, jobMembers, jobs } from '../../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/members/{member_id}:
 *   get:
 *     summary: Get a single job member
 *     tags: [JobMembers]
 *     responses:
 *       200:
 *         description: Job member details
 */
export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const orgMemberId = req.params.member_id

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }
        if (!contractId || !isValidUUID(contractId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }
        if (!orgMemberId || !isValidUUID(orgMemberId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const member = await db.query.organizationMembers.findFirst({
            where: and(
                eq(organizationMembers.id, orgMemberId),
                eq(organizationMembers.organizationId, orgId)
            ),
            with: {
                jobMembers: {
                    where: eq(jobMembers.jobId, jobId),
                    with: { job: true }
                }
            }
        });

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

        if (!member || !member.jobMembers || member.jobMembers.length === 0) {
            return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(member))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

