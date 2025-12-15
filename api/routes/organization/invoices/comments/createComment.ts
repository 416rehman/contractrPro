import { invoices } from '../../../../db';
import { createCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/invoices/{invoice_id}/comments:
 *   post:
 *     summary: Create a comment on an invoice
 *     tags: [InvoiceComments]
 *     responses:
 *       200:
 *         description: Comment created
 */
export default createCommentHandler({
    resourceTable: invoices,
    dbQueryKey: 'invoices',
    resourceIdParam: 'invoice_id',
    foreignKeyField: 'invoiceId'
});
