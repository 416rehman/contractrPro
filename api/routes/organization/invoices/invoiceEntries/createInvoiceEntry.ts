import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, invoices, invoiceEntries } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

// create invoice entry
export default async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid organization_id'))
        }

        if (!invoiceId || !isValidUUID(invoiceId)) {
            return res.status(400).json(createErrorResponse('Invoice ID is required'))
        }

        await db.transaction(async (tx) => {
            // make sure the invoice belongs to the org
            const invoice = await tx.query.invoices.findFirst({
                where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId))
            })
            if (!invoice) {
                // throw new Error('Invoice not found') 
                // Return json response instead of throwing error catch
                return res.status(400).json(createErrorResponse('Invoice not found'));
            }

            const [invoiceEntry] = await tx.insert(invoiceEntries)
                .values({
                    ...pick(req.body, [
                        'name',
                        'description',
                        'unitCost',
                        'quantity',
                    ]),
                    invoiceId: invoiceId,
                })
                .returning();

            res.status(200).json(createSuccessResponse(invoiceEntry))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
