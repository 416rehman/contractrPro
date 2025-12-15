import { db, vendors } from '../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../utils/response';
import { pick } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';

// Creates an organization's vendor
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
                'phone',
                'email',
                'website',
                'description',
            ]),
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        }

        const [vendor] = await db.insert(vendors).values(body).returning();
        res.status(201).json(createSuccessResponse(vendor))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
