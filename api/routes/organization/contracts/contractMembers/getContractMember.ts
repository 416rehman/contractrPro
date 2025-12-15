import { db, organizationMembers, contractMembers, contracts } from '../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/members/{member_id}:
 *   get:
 *     summary: Get a single contract member
 *     tags: [ContractMembers]
 *     responses:
 *       200:
 *         description: Contract member details
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const memberId = req.params.member_id

        if (!isValidUUID(contractId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!isValidUUID(memberId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const member = await db.query.organizationMembers.findFirst({
            where: and(
                eq(organizationMembers.organizationId, orgId),
                memberId ? eq(organizationMembers.id, memberId) : undefined
            ),
            with: {
                contractMembers: { where: eq(contractMembers.contractId, contractId) }
            }
        });

        if (!member || !member.contractMembers || member.contractMembers.length === 0) {
            return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(member))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
