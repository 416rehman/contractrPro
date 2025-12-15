import { db, clients } from '../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils';
import { eq, and } from 'drizzle-orm';

// Update organization client
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

        const body = {
            ...pick(req.body, [
                'name',
                'email',
                'phone',
                'website',
                'description',
            ]),
            updatedByUserId: req.auth.id,
        }

        const [updatedClient] = await db.update(clients)
            .set(body)
            .where(and(eq(clients.id, clientId), eq(clients.organizationId, orgId)))
            .returning();

        if (!updatedClient) {
            throw new Error('Client not found')
        }

        // return updated client
        res.status(200).json(createSuccessResponse(updatedClient))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
