import { db, clients } from '../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Delete organization client
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

        const deletedRows = await db.delete(clients)
            .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId)))
            .returning();

        if (!deletedRows.length) {
            return res
                .status(400)
                .json(createErrorResponse('Client not found'))
        }

        res.status(200).json(createSuccessResponse(deletedRows.length))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
