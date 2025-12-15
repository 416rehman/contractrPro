import { db, jobs, contracts } from '../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

// Post job
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

        // Check if contract exists and belongs to organization
        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractID), eq(contracts.organizationId, orgID))
        })

        if (!contract) {
            return res.status(400).json(createErrorResponse('Contract not found'))
        }

        const body = {
            ...pick(req.body, [
                'identifier',
                'name',
                'description',
                'status',
            ]),
            contractId: contractID,
            organizationId: orgID,
            updatedByUserId: req.auth.id,
        }

        const [createJob] = await db.insert(jobs).values(body).returning();

        return res.status(200).json(createSuccessResponse(createJob))
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to create job.', error))
    }
}
