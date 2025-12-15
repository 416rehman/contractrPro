import { db, clients } from '../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils';

export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        const body = {
            ...pick(req.body, [
                'name',
                'email',
                'phone',
                'website',
                'description',
            ]),
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        }

        const [client] = await db.insert(clients).values(body).returning();
        return res.status(201).json(createSuccessResponse(client))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
