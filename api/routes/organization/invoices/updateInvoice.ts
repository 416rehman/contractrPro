import { db, invoices, invoiceEntries } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils/index';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/invoices/{invoice_id}:
 *   patch:
 *     summary: Update an invoice
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: Invoice updated
 */
export default async (req, res) => {
    try {
        const { org_id, invoice_id } = req.params
        if (!org_id || !isValidUUID(org_id)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!invoice_id || !isValidUUID(invoice_id)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const entriesData = req.body?.InvoiceEntries?.map((entry: any) =>
            pick(entry, ['description', 'quantity', 'unitCost', 'name'])
        ) || []

        if (entriesData.length === 0) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        const body = {
            ...pick(req.body, ['invoiceNumber', 'issueDate', 'dueDate', 'poNumber', 'note', 'taxRate']),
            billToClientId: req.body.BillToClientId,
            contractId: req.body.ContractId,
            jobId: req.body.JobId,
            updatedByUserId: req.auth.id,
        }

        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

        await db.transaction(async (tx) => {
            const invoice = await tx.query.invoices.findFirst({
                where: and(eq(invoices.id, invoice_id), eq(invoices.organizationId, org_id))
            });

            if (!invoice) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

            await tx.update(invoices).set(body).where(eq(invoices.id, invoice.id));

            if (entriesData && entriesData.length > 0) {
                await tx.delete(invoiceEntries).where(eq(invoiceEntries.invoiceId, invoice.id));
                await tx.insert(invoiceEntries).values(entriesData.map((entry: any) => ({
                    ...entry,
                    invoiceId: invoice.id,
                    updatedByUserId: req.auth.id
                })));
            }

            const updatedInvoice = await tx.query.invoices.findFirst({
                where: eq(invoices.id, invoice.id),
                with: { invoiceEntries: true }
            });

            return res.status(200).json(createSuccessResponse(updatedInvoice))
        });
    } catch (e: any) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}
