import { invoices } from '../../../../db';
import { updateCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/invoices/{invoice_id}/comments/{comment_id}:
 *   patch:
 *     summary: Update an invoice comment
 *     tags: [InvoiceComments]
 *     responses:
 *       200:
 *         description: Comment updated
 */
export default updateCommentHandler({
    resourceTable: invoices,
    dbQueryKey: 'invoices',
    resourceIdParam: 'invoice_id',
    foreignKeyField: 'invoiceId'
});
