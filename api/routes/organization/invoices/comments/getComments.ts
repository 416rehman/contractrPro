import { invoices } from '../../../../db';
import { getCommentsHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/invoices/{invoice_id}/comments:
 *   get:
 *     summary: Get comments for an invoice
 *     tags: [InvoiceComments]
 *     responses:
 *       200:
 *         description: List of comments
 */
export default getCommentsHandler({
    resourceTable: invoices,
    dbQueryKey: 'invoices',
    resourceIdParam: 'invoice_id',
    foreignKeyField: 'invoiceId'
});
