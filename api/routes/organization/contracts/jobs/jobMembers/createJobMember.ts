import { db, jobs, organizations, organizationMembers, jobMembers } from '../../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../utils/response';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { pick } from '../../../../../utils';
import { eq, and } from 'drizzle-orm';

// Post jobMember
export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const memberId = req.body.OrganizationMemberId

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse('Invalid job id.'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        if (!memberId || !isValidUUID(memberId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid orgMember id.'))
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
            return res
                .status(400)
                .json(createErrorResponse('Failed to find orgMember.'))
        }

        // Verify job exists and belongs to contract/org
        const job = await db.query.jobs.findFirst({
            where: and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractId),
                eq(jobs.organizationId, orgId)
            )
        });

        if (!job) {
            return res
                .status(400)
                .json(createErrorResponse('Failed to find job.'))
        }

        // Check/Insert jobMember
        // Legacy used `addOrganizationMember` which likely upserts or ignores if exists?
        // Legacy comment: "Check if the orgMember is already a member of the job"
        // Then `addOrganizationMember`.
        // I will use upsert or just insert (if duplicate, constraints might fail or ignore).
        // Since schema likely has unique constraint on jobId+orgMemberId?
        // I'll check schema later but standard is composite PK or unique.
        // I'll try insert. If it fails, maybe check existence first?
        // Or simple insert.

        // Check existence first to prevent error
        const existing = await db.query.jobMembers.findFirst({
            where: and(
                eq(jobMembers.jobId, jobId),
                eq(jobMembers.organizationMemberId, memberId)
            )
        });

        if (existing) {
            // Update if exists? Legacy passed `through: body`. 
            // `permissionOverwrites` might need updating.
            await db.update(jobMembers)
                .set(body)
                .where(eq(jobMembers.id, existing.id));
            return res.status(200).json(createSuccessResponse(existing));
        }

        const [newMembership] = await db.insert(jobMembers).values({
            jobId: jobId,
            organizationMemberId: memberId,
            ...body
        }).returning();

        return res.status(200).json(createSuccessResponse(newMembership))
    } catch (err) {
        return res.status(500).json(createErrorResponse('', err))
    }
}
