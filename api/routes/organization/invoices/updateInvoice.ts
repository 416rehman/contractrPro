import { db, invoices, invoiceEntries } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils/index';
import { eq, and } from 'drizzle-orm';

// update invoice
export default async (req, res) => {
    try {
        const { org_id, invoice_id } = req.params
        if (!org_id || !isValidUUID(org_id)) return res.status(400).json(createErrorResponse('Invalid org_id'))
        if (!invoice_id || !isValidUUID(invoice_id)) return res.status(400).json(createErrorResponse('Invalid invoice_id'))

        const entriesData =
            req.body?.InvoiceEntries?.map((entry: any) =>
                pick(entry, ['description', 'quantity', 'unitCost', 'name'])
            ) || []

        if (entriesData.length === 0) {
            return res.status(400).json(createErrorResponse('InvoiceEntries is required. Provide at least one entry.'))
        }

        const body = {
            ...pick(req.body, [
                'invoiceNumber',
                'issueDate',
                'dueDate',
                'poNumber',
                'note',
                'taxRate',
                // 'BillToClientId',
            ]),
            billToClientId: req.body.BillToClientId,
            contractId: req.body.ContractId,
            jobId: req.body.JobId,
            updatedByUserId: req.auth.id,
        }

        // Clean undefined
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

        await db.transaction(async (tx) => {
            const invoice = await tx.query.invoices.findFirst({
                where: and(eq(invoices.id, invoice_id), eq(invoices.organizationId, org_id))
            });

            if (!invoice) {
                // Return must be processed by caller if throwing? No, Express doesn't catch async thrown unless wrapped.
                // We are inside try/catch so generic catch will handle throw.
                throw new Error('Invoice not found');
            }

            await tx.update(invoices).set(body).where(eq(invoices.id, invoice.id));

            if (entriesData && entriesData.length > 0) {
                // Delete existing
                await tx.delete(invoiceEntries).where(eq(invoiceEntries.invoiceId, invoice.id));

                // Create new
                await tx.insert(invoiceEntries).values(entriesData.map((entry: any) => ({
                    ...entry,
                    invoiceId: invoice.id,
                    updatedByUserId: req.auth.id
                })));
            }

            // Re-fetch
            const updatedInvoice = await tx.query.invoices.findFirst({
                where: eq(invoices.id, invoice.id),
                with: {
                    invoiceEntries: true
                }
            });

            return res.status(200).json(createSuccessResponse(updatedInvoice))
        });

    } catch (e: any) {
        const msg = e.message || '';
        const status = msg === 'Invoice not found' ? 400 : 500;
        return res.status(status).json(createErrorResponse('Error updating invoice', e))
    }
}
