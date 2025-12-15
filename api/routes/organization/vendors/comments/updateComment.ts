import { vendors } from '../../../../db';
import { updateCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/vendors/{vendor_id}/comments/{comment_id}:
 *   patch:
 *     summary: Update a vendor comment
 *     tags: [VendorComments]
 *     responses:
 *       200:
 *         description: Comment updated
 */
export default updateCommentHandler({
    resourceTable: vendors,
    dbQueryKey: 'vendors',
    resourceIdParam: 'vendor_id',
    foreignKeyField: 'vendorId'
});
