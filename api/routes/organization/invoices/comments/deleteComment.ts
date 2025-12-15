import { invoices } from '../../../../db';
import { deleteCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/invoices/{invoice_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete an invoice comment
 *     tags: [InvoiceComments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default deleteCommentHandler({
    resourceTable: invoices,
    dbQueryKey: 'invoices',
    resourceIdParam: 'invoice_id',
    foreignKeyField: 'invoiceId'
});
