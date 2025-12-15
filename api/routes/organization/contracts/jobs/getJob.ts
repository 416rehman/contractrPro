import { db, jobs } from '../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Get job
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

        const job = await db.query.jobs.findFirst({
            where: and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractID),
                eq(jobs.organizationId, orgID)
            ),
            with: {
                contract: true, // Legacy included Contract
            }
        })

        if (!job) {
            return res.status(400).json(createErrorResponse('Job not found'))
        }

        return res.status(200).json(createSuccessResponse(job))
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to get jobs.', error))
    }
}
