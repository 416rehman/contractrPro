import { db, contractMembers, contracts, organizationMembers } from '../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/members/{member_id}:
 *   delete:
 *     summary: Remove a member from a contract
 *     tags: [ContractMembers]
 *     responses:
 *       200:
 *         description: Contract member removed
 */
export default async (req, res) => {
    const orgId = req.params.org_id
    const contractId = req.params.contract_id
    const memberId = req.params.member_id

    if (!isValidUUID(contractId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
    if (!isValidUUID(memberId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
    if (!isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))

    try {
        const orgMember = await db.query.organizationMembers.findFirst({
            where: and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId))
        });

        if (!orgMember) return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
        });

        if (!contract) return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

        await db.delete(contractMembers)
            .where(and(
                eq(contractMembers.contractId, contractId),
                eq(contractMembers.organizationMemberId, memberId)
            ));

        return res.status(200).json(createSuccessResponse(null))
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
