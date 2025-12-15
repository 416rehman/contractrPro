import { db, organizationMembers, contractMembers, contracts } from '../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/members/{member_id}:
 *   patch:
 *     summary: Update a contract member
 *     tags: [ContractMembers]
 *     responses:
 *       200:
 *         description: Contract member updated
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const memberId = req.params.member_id

        if (!isValidUUID(contractId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!isValidUUID(memberId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const body = {
            ...pick(req.body, ['permissionOverwrites']),
            updatedByUserId: req.auth.id,
        }

        const orgMember = await db.query.organizationMembers.findFirst({
            where: and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId))
        });
        if (!orgMember) return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
        });
        if (!contract) return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

        const cm = await db.query.contractMembers.findFirst({
            where: and(
                eq(contractMembers.contractId, contractId),
                eq(contractMembers.organizationMemberId, memberId)
            )
        });

        if (!cm) return res.status(404).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

        await db.update(contractMembers).set(body).where(eq(contractMembers.id, cm.id));

        return res.status(200).json(createSuccessResponse(null))
    } catch (error) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}
