import { db, vendors } from '../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Deletes an organization's vendor by ID
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

        const deletedRows = await db.delete(vendors)
            .where(and(eq(vendors.id, vendorId), eq(vendors.organizationId, orgId)))
            .returning();

        if (!deletedRows.length) {
            return res
                .status(400)
                .json(createErrorResponse('Vendor not found'))
        }

        res.status(200).json(createSuccessResponse(deletedRows.length))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
