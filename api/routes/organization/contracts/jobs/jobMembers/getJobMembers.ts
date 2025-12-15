import { db, organizationMembers, jobMembers, jobs } from '../../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../utils/response';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Get jobMembers
export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

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

        // Verify job context first
        const jobValid = await db.query.jobs.findFirst({
            where: and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractId),
                eq(jobs.organizationId, orgId)
            )
        });

        if (!jobValid) {
            return res.status(404).json(createErrorResponse('Job not found'))
        }

        // Find jobMembers for the job
        // Legacy: OrganizationMember.findAll with inner join Job.
        // Returns OrganizationMembers who are in this job.

        // Optimized Drizzle query:
        // Select from OrganizationMembers where exists in JobMembers(jobId).
        // OR: query JobMembers with logic?
        // Legacy returns `OrganizationMember` entities.

        // I will select OrganizationMembers and filter by having a jobMember entry for this job.
        // But `where` clause on relation in Drizzle:

        const members = await db.query.organizationMembers.findMany({
            where: eq(organizationMembers.organizationId, orgId),
            with: {
                jobMembers: {
                    where: eq(jobMembers.jobId, jobId)
                }
            }
        });

        // Filter in memory for those who have the jobMember?
        // `with` usually just loads related data. It doesn't filter the parent unless I use `where` carefully.
        // If I want ONLY members OF THIS JOB:
        // Better to query `jobMembers` and `with: { organizationMember: true }` and map it?
        // Legacy returns `OrganizationMember`.
        // If I use `jobMembers` query, I get `JobMember` objects containing `OrganizationMember`.
        // I can map it.

        const jms = await db.query.jobMembers.findMany({
            where: eq(jobMembers.jobId, jobId),
            with: {
                organizationMember: true
            }
        });

        const result = jms.map(jm => jm.organizationMember);

        // However, legacy output might include `Job` or `JobMember` data attached?
        // Legacy code: `include: [{ model: Job }]`.
        // So each orgMember has `Job` (singular?) attached? Or `Jobs`?
        // It says `model: Job`. Since relationship is many-to-many through JobMember.
        // Sequelize likely attaches `Jobs` list (or single Job because of `where jobId`).
        // And `JobMember` data (junction table) is usually in `Job.JobMember` or `OrganizationMember.JobMember`.
        // I'll stick to returning `OrganizationMember` list. If client needs junction data, it's usually in `JobMember`.
        // The mapped result above returns raw `OrganizationMember`.
        // Legacy output structure: `[ { ...orgMemberFields, Jobs: [ { ...jobFields, JobMember: { ... } } ] } ]`
        // Wait, if I use `jobMembers` table query: `[ { ...jobMemberFields, organizationMember: { ... } } ]`.
        // This is DIFFERENT structure.
        // I should try to preserve structure if possible.
        // Legacy: `OrganizationMember.findAll`.
        // So it returns `OrganizationMember[]`.
        // Included `Job` implies `member.Jobs[]`.

        // I'll try to replicate:
        const membersWithJobs = await db.query.organizationMembers.findMany({
            where: eq(organizationMembers.organizationId, orgId),
            with: {
                jobMembers: {
                    where: eq(jobMembers.jobId, jobId),
                    with: {
                        job: true
                    }
                }
            }
        });

        // Filter out those with empty jobMembers
        const filtered = membersWithJobs.filter(m => m.jobMembers && m.jobMembers.length > 0);

        if (!filtered || filtered.length === 0) {
            // Legacy returns 404 if "JobMembers not found"?
            // Or empty array?
            // Legacy `if (!jobMembers)` - findAll usually returns [].
            // I'll return empty array to be safe, or 404 if really desired.
            // Legacy code `if (!jobMembers) return 404`.
            // I'll return 200 [] if empty, as findAll validly returns []. 
            // Unless "Job not found" logic applies.
        }

        return res.status(200).json(createSuccessResponse(filtered))
    } catch (err) {
        return res.status(500).json(createErrorResponse('Server error.', err))
    }
}
