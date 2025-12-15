import { db, organizationMembers, contractMembers, contracts } from '../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/members:
 *   get:
 *     summary: Get all members for a contract
 *     tags: [ContractMembers]
 *     responses:
 *       200:
 *         description: List of contract members
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!isValidUUID(contractId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))

        const members = await db.query.organizationMembers.findMany({
            where: eq(organizationMembers.organizationId, orgId),
            with: {
                contractMembers: { where: eq(contractMembers.contractId, contractId) }
            }
        });

        const filtered = members.filter(m => m.contractMembers && m.contractMembers.length > 0);

        return res.status(200).json(createSuccessResponse(filtered))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
