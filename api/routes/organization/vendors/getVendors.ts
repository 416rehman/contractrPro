import { db, vendors } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

// Gets all of the organization's vendors
export default async (req, res) => {
    try {
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        const vendorsList = await db.query.vendors.findMany({
            where: eq(vendors.organizationId, orgId)
        })

        return res.status(200).json(createSuccessResponse(vendorsList))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
