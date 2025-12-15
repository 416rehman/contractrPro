import { invoices } from '../../../../../db';
import { deleteAttachmentHandler } from '../../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/invoices/{invoice_id}/comments/{comment_id}/attachments/{attachment_id}:
 *   delete:
 *     summary: Delete an attachment from an invoice comment
 *     tags: [InvoiceComments]
 *     responses:
 *       200:
 *         description: Attachment deleted
 */
export default deleteAttachmentHandler({
    resourceTable: invoices,
    dbQueryKey: 'invoices',
    resourceIdParam: 'invoice_id',
    foreignKeyField: 'invoiceId'
});
