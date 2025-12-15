import { db, organizationMembers, jobMembers, jobs } from '../../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../utils/response';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Get jobMember
export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const orgMemberId = req.params.member_id

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

        if (!orgMemberId || !isValidUUID(orgMemberId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid jobMember id.'))
        }

        // Find jobMember for the job
        // Legacy: Returns `OrganizationMember` with nested `Job` info.
        // Meaning it returns the OrganizationMember profile IF they are in the job.

        // Drizzle: Query organizationMembers where id = orgMemberId AND exists relationship.
        const member = await db.query.organizationMembers.findFirst({
            where: and(
                eq(organizationMembers.id, orgMemberId),
                eq(organizationMembers.organizationId, orgId)
            ),
            with: {
                jobMembers: {
                    where: eq(jobMembers.jobId, jobId),
                    with: {
                        job: {
                            // verify contractId? 
                            // The `where` on jobMembers connects to job. 
                            // I can't easily filter `job.contractId` inside the `with` unless I use extra logic.
                            // But I can trust that if they asked for `jobId`, we check if `jobId` belongs to `contractId` separately or assume validity if DB is consistent.
                            // Legacy: `include Job where id=jobId, ContractId=contractId`.
                            // So it enforces job validity.
                        }
                    }
                }
            }
        });

        // Manual validation of job context:
        // Check if `member.jobMembers` has any entry that links to local jobId (which is filtered in `with`).
        // But need to ensure that `job` actually belongs to `contractId`.
        // The above query fetches `jobMembers` for `jobId`.
        // I should also verify `jobId` belongs to `contractId` and `orgId`.
        // I'll do a quick separate check or assume if record exists it's valid?
        // Safer to check.

        const jobValid = await db.query.jobs.findFirst({
            where: and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractId),
                eq(jobs.organizationId, orgId)
            )
        });

        if (!jobValid) {
            // Legacy returned "JobMember not found" if ANY part required failed (inner join).
            // Basically 404.
            return res.status(404).json(createErrorResponse('JobMember not found (Job context invalid).'))
        }

        if (!member || !member.jobMembers || member.jobMembers.length === 0) {
            return res
                .status(404)
                .json(createErrorResponse('JobMember not found.'))
        }

        return res.status(200).json(createSuccessResponse(member))
    } catch (err) {
        return res.status(500).json(createErrorResponse('', err))
    }
}
