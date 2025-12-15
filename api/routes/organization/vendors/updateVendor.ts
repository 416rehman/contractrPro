import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils';
import { db, vendors } from '../../../db';
import { eq, and } from 'drizzle-orm';

// Updates an organization's vendor by ID
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const vendorId = req.params.vendor_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }
        if (!vendorId || !isValidUUID(vendorId)) {
            return res
                .status(400)
                .json(createErrorResponse('Vendor ID is required'))
        }
        const body = {
            ...pick(req.body, [
                'name',
                'phone',
                'email',
                'website',
                'description',
            ]),
            updatedByUserId: req.auth.id,
        }

        const [updatedVendor] = await db.update(vendors)
            .set(body)
            .where(and(eq(vendors.id, vendorId), eq(vendors.organizationId, orgId)))
            .returning();

        if (!updatedVendor) {
            throw new Error('Vendor not found')
        }

        return res.status(200).json(createSuccessResponse(updatedVendor))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
