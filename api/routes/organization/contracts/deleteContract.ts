import { db, contracts } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID required'))
        }

        const deletedRows = await db.delete(contracts)
            .where(and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId)))
            .returning();

        if (!deletedRows.length) {
            return res
                .status(400)
                .json(createErrorResponse('Contract not found'))
        }

        res.status(200).json(createSuccessResponse(deletedRows.length))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
