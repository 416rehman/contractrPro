import { db, contracts } from '../../../db';
import { isValidUUID } from '../../../utils/isValidUUID';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}:
 *   get:
 *     summary: Get a single contract by ID
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
 *         description: Contract details
 *       400:
 *         description: Invalid ID or not found
 */
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        } else if (!contractID || !isValidUUID(contractID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const organizationContract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractID), eq(contracts.organizationId, orgID)),
            with: { jobs: true }
        })

        if (!organizationContract) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(organizationContract))
    } catch (error) {
        res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

