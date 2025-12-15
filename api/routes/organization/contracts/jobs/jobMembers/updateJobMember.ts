import { db, jobMembers, jobs, organizationMembers } from '../../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../utils/response';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { pick } from '../../../../../utils';
import { eq, and } from 'drizzle-orm';

// Update Job Member
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const jobId = req.params.job_id
        const memberId = req.params.member_id

        if (!isValidUUID(contractId)) res.status(400).json(createErrorResponse('Invalid contract_id'))
        if (!isValidUUID(orgId)) res.status(400).json(createErrorResponse('Invalid org_id'))
        if (!isValidUUID(jobId)) res.status(400).json(createErrorResponse('Invalid job_id'))
        if (!isValidUUID(memberId)) res.status(400).json(createErrorResponse('Invalid member_id'))

        const body = {
            ...pick(req.body, ['permissionOverwrites']),
            updatedByUserId: req.auth.id,
        }

        // Validate context
        const orgMember = await db.query.organizationMembers.findFirst({
            where: and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId))
        });
        if (!orgMember) return res.status(404).json(createErrorResponse('Organization member not found'));

        const job = await db.query.jobs.findFirst({
            where: and(eq(jobs.id, jobId), eq(jobs.contractId, contractId), eq(jobs.organizationId, orgId))
        });
        if (!job) return res.status(404).json(createErrorResponse('Job not found'));

        // Update Job Member
        const result = await db.update(jobMembers)
            .set(body)
            .where(and(
                eq(jobMembers.jobId, jobId),
                eq(jobMembers.organizationMemberId, memberId)
            ))
            .returning();

        if (!result.length) {
            return res.status(404).json(createErrorResponse('Job member not found'))
        }

        return res.status(200).json(createSuccessResponse('Job member updated successfully'))

    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Internal server error', err))
    }
}
