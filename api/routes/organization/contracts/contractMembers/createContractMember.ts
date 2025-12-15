import { db, contractMembers, contracts, organizationMembers } from '../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

// Create Contract Member
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const memberId = req.body.OrganizationMemberId

        if (!isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract_id'))
        }

        if (!isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org_id'))
        }

        const body = {
            ...pick(req.body, ['permissions']),
        }

        const [orgMember] = await db.select().from(organizationMembers).where(and(
            eq(organizationMembers.id, memberId),
            eq(organizationMembers.organizationId, orgId)
        ));

        if (!orgMember) {
            return res
                .status(404)
                .json(createErrorResponse('Organization member not found'))
        }

        const [contract] = await db.select().from(contracts).where(and(
            eq(contracts.id, contractId),
            eq(contracts.organizationId, orgId) // Ensure org ownership
        ));

        if (!contract) {
            return res
                .status(404)
                .json(createErrorResponse('Contract not found'))
        }

        // Upsert or Insert check
        const existing = await db.query.contractMembers.findFirst({
            where: and(
                eq(contractMembers.contractId, contractId),
                eq(contractMembers.organizationMemberId, memberId)
            )
        });

        if (existing) {
            await db.update(contractMembers)
                .set(body)
                .where(eq(contractMembers.id, existing.id));
            return res.status(200).json(createSuccessResponse(existing));
        }

        const [result] = await db.insert(contractMembers).values({
            contractId: contractId,
            organizationMemberId: memberId,
            ...body
        }).returning();

        return res.status(200).json(createSuccessResponse(result))
    } catch (err) {
        return res.status(500).json(createErrorResponse('', err))
    }
}
