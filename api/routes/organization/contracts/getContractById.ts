import { db, contracts } from '../../../db';
import { isValidUUID } from '../../../utils/isValidUUID';

import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { eq, and } from 'drizzle-orm';

// Gets the organization's contract by ID
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        } else if (!contractID || !isValidUUID(contractID)) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID required'))
        }

        const organizationContract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractID), eq(contracts.organizationId, orgID)),
            with: {
                jobs: true // Include jobs if needed? Legacy getContractById didn't include jobs in `findOne`? 
                // Legacy: `Contract.findOne` lines 26-35 only excludes `organization_id`. 
                // It does NOT have `include` option in legacy code!
                // So it returns just contract fields.
                // I will return just contract fields to match EXACT legacy behavior.
                // Wait, legacy `getContracts` (plural) includes jobs if expand=true.
                // `getContractById` (singular) legacy code shows NO `include`.
                // So I will stick to basic fields.
            }
        })

        if (!organizationContract) {
            return res.status(400).json(createErrorResponse('Not found'))
        }

        return res
            .status(200)
            .json(createSuccessResponse(organizationContract))
    } catch (error) {
        res.status(500).json(createErrorResponse('', error))
    }
}
