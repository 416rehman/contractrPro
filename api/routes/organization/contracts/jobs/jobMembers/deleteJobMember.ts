import { db, jobMembers, jobs, organizationMembers } from '../../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../utils/response';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Delete jobMember
export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const orgMemberId = req.params.member_id

        if (!jobId || !isValidUUID(jobId)) res.status(400).json(createErrorResponse('Invalid job id.'))
        if (!contractId || !isValidUUID(contractId)) res.status(400).json(createErrorResponse('Invalid contract id.'))
        if (!orgId || !isValidUUID(orgId)) res.status(400).json(createErrorResponse('Invalid org id.'))
        if (!orgMemberId || !isValidUUID(orgMemberId)) res.status(400).json(createErrorResponse('Invalid orgMember id.'))

        // Reuse validation logic from update/create?
        // Check job context
        const job = await db.query.jobs.findFirst({
            where: and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractId),
                eq(jobs.organizationId, orgId)
            )
        });
        if (!job) return res.status(400).json(createErrorResponse('Failed to find job.')); // Legacy said 400

        // Check org member (not strictly needed for delete if unique constraint but good validation)
        const orgMember = await db.query.organizationMembers.findFirst({
            where: and(eq(organizationMembers.id, orgMemberId), eq(organizationMembers.organizationId, orgId))
        });
        if (!orgMember) return res.status(400).json(createErrorResponse('Failed to find orgMember.'));

        // Delete
        const deleted = await db.delete(jobMembers)
            .where(and(
                eq(jobMembers.jobId, jobId),
                eq(jobMembers.organizationMemberId, orgMemberId)
            ))
            .returning();

        // Legacy: returned `result` of removeOrganizationMember. 
        // This usually returns count or similar.
        // I'll return count.

        return res.status(200).json(createSuccessResponse(deleted.length))
    } catch (err) {
        return res.status(500).json(createErrorResponse('', err))
    }
}
