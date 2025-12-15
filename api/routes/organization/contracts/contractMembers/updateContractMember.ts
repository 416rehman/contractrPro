import { db, organizationMembers, contractMembers, contracts } from '../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

// Update Contract Member
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const memberId = req.params.member_id

        if (!isValidUUID(contractId)) res.status(400).json(createErrorResponse('Invalid contract_id'))
        if (!isValidUUID(orgId)) res.status(400).json(createErrorResponse('Invalid org_id'))
        if (!isValidUUID(memberId)) res.status(400).json(createErrorResponse('Invalid member_id'))

        const body = {
            ...pick(req.body, ['permissionOverwrites']),
            updatedByUserId: req.auth.id,
        }

        // Validate entities
        const orgMember = await db.query.organizationMembers.findFirst({
            where: and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId))
        });
        if (!orgMember) return res.status(404).json(createErrorResponse('Organization member not found'));

        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
        });
        if (!contract) return res.status(404).json(createErrorResponse('Contract not found'));

        // Update
        const cm = await db.query.contractMembers.findFirst({
            where: and(
                eq(contractMembers.contractId, contractId),
                eq(contractMembers.organizationMemberId, memberId)
            )
        });

        if (!cm) return res.status(404).json(createErrorResponse('Contract member not found'));

        await db.update(contractMembers)
            .set(body)
            .where(eq(contractMembers.id, cm.id));

        return res.status(200).json(createSuccessResponse('Contract member updated'))

    } catch (error) {
        console.log(error)
        return res.status(500).json(createErrorResponse('Server error'))
    }
}
