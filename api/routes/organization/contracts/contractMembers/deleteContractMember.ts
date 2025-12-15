import { db, contractMembers, contracts, organizationMembers } from '../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Delete Contract Member
export default async (req, res) => {
    const orgId = req.params.org_id
    const contractId = req.params.contract_id
    const memberId = req.params.member_id

    if (!isValidUUID(contractId)) return res.status(400).json(createErrorResponse('Invalid contract_id'))
    if (!isValidUUID(memberId)) return res.status(400).json(createErrorResponse('Invalid member_id'))
    if (!isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org_id'))

    try {
        const orgMember = await db.query.organizationMembers.findFirst({
            where: and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId))
        });

        if (!orgMember) {
            return res.status(404).json(createErrorResponse('Contract member not found'))
        }

        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
        });

        if (!contract) {
            return res.status(404).json(createErrorResponse('Contract not found'))
        }

        // Delete from junction
        await db.delete(contractMembers)
            .where(and(
                eq(contractMembers.contractId, contractId),
                eq(contractMembers.organizationMemberId, memberId)
            ));

        return res
            .status(200)
            .json(createSuccessResponse('Contract member deleted'))
    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Failed to delete contract member'))
    }
}
