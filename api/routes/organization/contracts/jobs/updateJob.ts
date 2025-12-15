import { db, jobs } from '../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

// Put job
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id
        const jobId = req.params.job_id

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse('Organization ID required'))
        }

        if (!contractID || !isValidUUID(contractID)) {
            return res.status(400).json(createErrorResponse('Contract ID required'))
        }

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse('Job ID required'))
        }

        const body = {
            ...pick(req.body, [
                'identifier',
                'name',
                'description',
                'status',
            ]),
            contractId: contractID, // Ensure it stays in this contract?
            organizationId: orgID,
            updatedByUserId: req.auth.id,
        }

        const [updatedJob] = await db.update(jobs)
            .set(body)
            .where(and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractID),
                eq(jobs.organizationId, orgID)
            ))
            .returning();

        if (!updatedJob) {
            return res.status(400).json(createErrorResponse('Job not found or access denied'))
        }

        return res.status(200).json(createSuccessResponse(updatedJob))
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to update job.', error))
    }
}
