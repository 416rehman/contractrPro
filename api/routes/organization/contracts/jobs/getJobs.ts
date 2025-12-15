import { db, jobs } from '../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Get jobs
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse('Organization ID required'))
        }

        if (!contractID || !isValidUUID(contractID)) {
            return res.status(400).json(createErrorResponse('Contract ID required'))
        }

        const jobList = await db.query.jobs.findMany({
            where: and(
                eq(jobs.contractId, contractID),
                eq(jobs.organizationId, orgID)
            ),
            with: {
                contract: true
            }
        })

        // Legacy code checked `if (!jobs) return 400 "Contract not found"`.
        // But findAll returns empty array if not found, not null/undefined?
        // Actually Promise<Model[]> always resolves to array.
        // Legacy check was `if (!jobs)`.
        // But if contract doesn't exist, search for jobs returns [] or fails?
        // If contract doesn't exist, we probably return empty array or 404?
        // Legacy code: returned "Contract not found" if jobs is falsy? 
        // `findAll` usually returns `[]`. `[]` is truthy.
        // So legacy code block `if (!jobs)` was probably unreachable unless DB error?
        // Wait, legacy also had `include Contract with required: true`. 
        // If contract didn't match, the inner join would return 0 rows.
        // But `jobs` array would be `[]`, not null.
        // So `!jobs` is false.
        // Maybe legacy meant `jobs.length === 0`? No, standard findAll is [].
        // I will return empty array if empty, unless I want to explicitly check contract existence first.
        // I will trust returning [] is fine. Or verify contract first?
        // I'll stick to returning found jobs.

        return res.status(200).json(createSuccessResponse(jobList))

    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to get jobs.', error))
    }
}
