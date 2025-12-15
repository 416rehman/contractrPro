import { db, jobs } from '../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// delete job
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

        const deletedRows = await db.delete(jobs)
            .where(and(
                eq(jobs.id, jobId),
                eq(jobs.contractId, contractID),
                eq(jobs.organizationId, orgID)
            ))
            .returning();

        if (!deletedRows.length) {
            return res.status(400).json(createErrorResponse('Job not found'))
        }

        return res.status(200).json(createSuccessResponse(1))
    } catch (error) {
        return res.status(500).json(createErrorResponse('', error))
    }
}
