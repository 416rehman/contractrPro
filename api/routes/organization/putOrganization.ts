import { db, organizations } from '../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../utils/response';
import { pick } from '../../utils';
import { eq } from 'drizzle-orm';

// Updates an organization
export default async (req, res) => {
    try {
        const body = {
            ...pick(req.body, [
                'name',
                'description',
                'email',
                'phone',
                'website',
                'logoUrl',
            ]),
            // UpdatedByUserId: req.auth.id, // Not in schema yet?
        }

        const orgId = req.params.org_id
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization id is required'))
        }

        const [updatedOrg] = await db.update(organizations)
            .set(body)
            .where(eq(organizations.id, orgId))
            .returning();

        if (!updatedOrg) {
            return res.status(404).json(createErrorResponse('Organization not found'))
        }

        return res.status(200).json(createSuccessResponse(updatedOrg))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
