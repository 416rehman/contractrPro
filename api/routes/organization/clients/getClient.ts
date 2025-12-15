import { db, clients } from '../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Get organization client
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const clientId = req.params.client_id
        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }
        if (!clientId || !isValidUUID(clientId)) {
            return res
                .status(400)
                .json(createErrorResponse('Client ID is required'))
        }

        const client = await db.query.clients.findFirst({
            where: and(
                eq(clients.organizationId, orgId),
                eq(clients.id, clientId)
            )
        })

        if (!client) {
            return res.status(400).json(createErrorResponse('Client not found'))
        }

        res.status(200).json(createSuccessResponse(client))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
