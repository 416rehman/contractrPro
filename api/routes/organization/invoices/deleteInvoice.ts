import { db, invoices } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/invoices/{invoice_id}:
 *   delete:
 *     summary: Delete an invoice
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: Invoice deleted
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const invoiceId = req.params.invoice_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const deletedRows = await db.delete(invoices)
            .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId)))
            .returning();

        if (!deletedRows.length) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        res.status(200).json(createSuccessResponse(null))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
