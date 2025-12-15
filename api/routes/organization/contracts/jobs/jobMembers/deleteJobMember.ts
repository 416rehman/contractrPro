import { db, jobMembers, jobs, organizationMembers } from '../../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/members/{member_id}:
 *   delete:
 *     summary: Remove a member from a job
 *     tags: [JobMembers]
 *     responses:
 *       200:
 *         description: Job member removed
 */
export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const orgMemberId = req.params.member_id

        if (!jobId || !isValidUUID(jobId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!contractId || !isValidUUID(contractId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!orgMemberId || !isValidUUID(orgMemberId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const job = await db.query.jobs.findFirst({
            where: and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractId),
                eq(jobs.organizationId, orgId)
            )
        });
        if (!job) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

        const orgMember = await db.query.organizationMembers.findFirst({
            where: and(eq(organizationMembers.id, orgMemberId), eq(organizationMembers.organizationId, orgId))
        });
        if (!orgMember) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

        await db.delete(jobMembers)
            .where(and(
                eq(jobMembers.jobId, jobId),
                eq(jobMembers.organizationMemberId, orgMemberId)
            ))
            .returning();

        return res.status(200).json(createSuccessResponse(null))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

