import { vendors } from '../../../../../db';
import { deleteAttachmentHandler } from '../../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/vendors/{vendor_id}/comments/{comment_id}/attachments/{attachment_id}:
 *   delete:
 *     summary: Delete an attachment from a vendor comment
 *     tags: [VendorComments]
 *     responses:
 *       200:
 *         description: Attachment deleted
 */
export default deleteAttachmentHandler({
    resourceTable: vendors,
    dbQueryKey: 'vendors',
    resourceIdParam: 'vendor_id',
    foreignKeyField: 'vendorId'
});
