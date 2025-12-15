import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, invoices, invoiceEntries } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// get invoice entry
export default async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id
        const invoiceEntryId = req.params.entry_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid organization_id'))
        if (!invoiceEntryId || !isValidUUID(invoiceEntryId)) return res.status(400).json(createErrorResponse('InvoiceEntry ID is required'))
        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse('Invoice ID is required'))

        // make sure the invoice belongs to the org
        const invoice = await db.query.invoices.findFirst({
            where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId))
        })
        if (!invoice) {
            return res.status(400).json(createErrorResponse('Invoice not found'))
        }

        const invoiceEntry = await db.query.invoiceEntries.findFirst({
            where: and(
                eq(invoiceEntries.invoiceId, invoiceId),
                eq(invoiceEntries.id, invoiceEntryId)
            )
        })

        if (!invoiceEntry) {
            return res.status(400).json(createErrorResponse('InvoiceEntry not found'))
        }

        res.status(200).json(createSuccessResponse(invoiceEntry))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
