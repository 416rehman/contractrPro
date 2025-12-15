import { db, jobMembers, jobs, organizationMembers } from '../../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { pick } from '../../../../../utils';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/members/{member_id}:
 *   patch:
 *     summary: Update a job member
 *     tags: [JobMembers]
 *     responses:
 *       200:
 *         description: Job member updated
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const jobId = req.params.job_id
        const memberId = req.params.member_id

        if (!isValidUUID(contractId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!isValidUUID(jobId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!isValidUUID(memberId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const body = {
            ...pick(req.body, ['permissionOverwrites']),
            updatedByUserId: req.auth.id,
        }

        const orgMember = await db.query.organizationMembers.findFirst({
            where: and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId))
        });
        if (!orgMember) return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

        const job = await db.query.jobs.findFirst({
            where: and(eq(jobs.id, jobId), eq(jobs.contractId, contractId), eq(jobs.organizationId, orgId))
        });
        if (!job) return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

        const result = await db.update(jobMembers)
            .set(body)
            .where(and(
                eq(jobMembers.jobId, jobId),
                eq(jobMembers.organizationMemberId, memberId)
            ))
            .returning();

        if (!result.length) {
            return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(null))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

