import { db, organizationMembers } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        const members = await db.query.organizationMembers.findMany({
            where: eq(organizationMembers.organizationId, orgId)
        })

        return res
            .status(200)
            .json(createSuccessResponse(members))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
