import { vendors } from '../../../../db';
import { createCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/vendors/{vendor_id}/comments:
 *   post:
 *     summary: Create a comment on a vendor
 *     tags: [VendorComments]
 *     responses:
 *       200:
 *         description: Comment created
 */
export default createCommentHandler({
    resourceTable: vendors,
    dbQueryKey: 'vendors',
    resourceIdParam: 'vendor_id',
    foreignKeyField: 'vendorId'
});
