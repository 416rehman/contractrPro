import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { db, invoices, invoiceEntries } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/invoices/{invoice_id}/entries:
 *   get:
 *     summary: Get all entries for an invoice
 *     tags: [InvoiceEntries]
 *     responses:
 *       200:
 *         description: List of invoice entries
 */
export default async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const invoice = await db.query.invoices.findFirst({
            where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId))
        })
        if (!invoice) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

        const entries = await db.query.invoiceEntries.findMany({
            where: eq(invoiceEntries.invoiceId, invoiceId)
        })

        res.status(200).json(createSuccessResponse(entries))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
