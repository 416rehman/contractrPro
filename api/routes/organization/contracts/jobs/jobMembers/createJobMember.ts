import { db, jobs, organizations, organizationMembers, jobMembers } from '../../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { pick } from '../../../../../utils';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/members:
 *   post:
 *     summary: Add a member to a job
 *     tags: [JobMembers]
 *     responses:
 *       200:
 *         description: Job member added
 */
export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const memberId = req.body.OrganizationMemberId

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }
        if (!contractId || !isValidUUID(contractId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }
        if (!memberId || !isValidUUID(memberId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const body = {
            ...pick(req.body, ['permissionOverwrites']),
            updatedByUserId: req.auth.id,
        }

        const [orgMember] = await db.select().from(organizationMembers).where(and(
            eq(organizationMembers.id, memberId),
            eq(organizationMembers.organizationId, orgId)
        ));

        if (!orgMember) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        const job = await db.query.jobs.findFirst({
            where: and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractId),
                eq(jobs.organizationId, orgId)
            )
        });

        if (!job) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        const existing = await db.query.jobMembers.findFirst({
            where: and(
                eq(jobMembers.jobId, jobId),
                eq(jobMembers.organizationMemberId, memberId)
            )
        });

        if (existing) {
            await db.update(jobMembers).set(body).where(eq(jobMembers.id, existing.id));
            return res.status(200).json(createSuccessResponse(existing));
        }

        const [newMembership] = await db.insert(jobMembers).values({
            jobId: jobId,
            organizationMemberId: memberId,
            ...body
        }).returning();

        return res.status(200).json(createSuccessResponse(newMembership))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

