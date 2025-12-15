import { db, organizationMembers } from '../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../utils/response';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';

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
                'permissions',
                'UserId',
            ]),
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        }

        // Map 'UserId' from request body to 'userId' for schema
        if (body.UserId) {
            (body as any).userId = body.UserId;
            delete (body as any).UserId;
        }

        const [member] = await db.insert(organizationMembers).values(body).returning();

        res.status(201).json(createSuccessResponse(member))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
