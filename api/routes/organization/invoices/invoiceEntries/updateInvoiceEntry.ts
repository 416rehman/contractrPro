import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, invoices, invoiceEntries } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

// update invoice entry
export default async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id
        const invoiceEntryId = req.params.entry_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid organization_id'))
        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse('Invoice ID is required'))
        if (!invoiceEntryId || !isValidUUID(invoiceEntryId)) return res.status(400).json(createErrorResponse('InvoiceEntry ID is required'))

        await db.transaction(async (tx) => {
            // make sure the invoice belongs to the org
            const invoice = await tx.query.invoices.findFirst({
                where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId))
            })
            if (!invoice) {
                return res.status(400).json(createErrorResponse('Invoice not found'));
            }

            const [updatedInvoiceEntry] = await tx.update(invoiceEntries)
                .set({
                    ...pick(req.body, [
                        'name',
                        'description',
                        'unitCost',
                        'quantity',
                    ]),
                })
                .where(and(
                    eq(invoiceEntries.invoiceId, invoiceId),
                    eq(invoiceEntries.id, invoiceEntryId)
                ))
                .returning();

            if (!updatedInvoiceEntry) {
                return res.status(400).json(createErrorResponse('InvoiceEntry not found'))
            }

            res.status(200).json(createSuccessResponse(updatedInvoiceEntry))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
