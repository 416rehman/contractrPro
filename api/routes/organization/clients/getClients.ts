import { db, clients } from '../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

// Get organization clients
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        const clientList = await db.query.clients.findMany({
            where: eq(clients.organizationId, orgId)
        })

        res.status(200).json(createSuccessResponse(clientList))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
