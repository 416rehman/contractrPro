// DELETE /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id
import { db, invoices } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const invoiceId = req.params.invoice_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Organization ID is required'))
        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse('Invoice ID is required'))

        const deletedRows = await db.delete(invoices)
            .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId)))
            .returning();

        if (!deletedRows.length) {
            return res.status(400).json(createErrorResponse('Invoice not found'))
        }

        res.status(200).json(createSuccessResponse(deletedRows.length))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
