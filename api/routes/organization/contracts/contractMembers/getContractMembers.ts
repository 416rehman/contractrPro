import { db, organizationMembers, contractMembers, contracts } from '../../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Get Contract Members
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract_id'))
        }

        if (!isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org_id'))
        }

        // Verify contract context?
        // Legacy: OrganizationMember.findAll include Contract(where id, required).

        const members = await db.query.organizationMembers.findMany({
            where: eq(organizationMembers.organizationId, orgId),
            with: {
                contractMembers: {
                    where: eq(contractMembers.contractId, contractId)
                }
            }
        });

        // Filter those who have the contract member entry
        const filtered = members.filter(m => m.contractMembers && m.contractMembers.length > 0);

        // Legacy returns 404 if "members not found" (which technically acts as empty array check).
        if (!filtered || filtered.length === 0) {
            return res
                .status(404)
                .json(createErrorResponse('Contract members not found'))
        }

        return res.status(200).json(createSuccessResponse(filtered))
    } catch (err) {
        console.error(err)
        return res
            .status(500)
            .json(createErrorResponse('Failed to get contract members'))
    }
}
