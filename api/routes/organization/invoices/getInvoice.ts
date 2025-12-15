import { db, invoices } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// get invoice
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const invoiceId = req.params.invoice_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid organization_id'))
        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse('Invalid invoice_id'))

        const invoice = await db.query.invoices.findFirst({
            where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId)),
            with: {
                invoiceEntries: true // Always include? Legacy had `include: { model: InvoiceEntry }` always.
            }
        });

        if (!invoice) {
            return res.status(400).json(createErrorResponse('Invoice not found'))
        }

        return res.status(200).json(createSuccessResponse(invoice))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
