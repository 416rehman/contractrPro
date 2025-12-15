import { db, vendors } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Get an organization's vendor by ID
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

        const vendor = await db.query.vendors.findFirst({
            where: and(
                eq(vendors.organizationId, orgId),
                eq(vendors.id, vendorId)
            )
        })

        if (!vendor) {
            return res
                .status(400)
                .json(createErrorResponse('Vendor not found'))
        }

        return res.status(200).json(createSuccessResponse(vendor))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
