import { db, contracts } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}:
 *   delete:
 *     summary: Delete a contract
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: contract_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract deleted
 *       400:
 *         description: Invalid ID or not found
 */
export default async (req, res) => {
    try {
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const deletedRows = await db.delete(contracts)
            .where(and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId)))
            .returning();

        if (!deletedRows.length) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        res.status(200).json(createSuccessResponse(null))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

