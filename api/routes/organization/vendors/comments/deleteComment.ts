import { vendors } from '../../../../db';
import { deleteCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/vendors/{vendor_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete a vendor comment
 *     tags: [VendorComments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default deleteCommentHandler({
    resourceTable: vendors,
    dbQueryKey: 'vendors',
    resourceIdParam: 'vendor_id',
    foreignKeyField: 'vendorId'
});
