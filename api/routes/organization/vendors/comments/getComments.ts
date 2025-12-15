import { vendors } from '../../../../db';
import { getCommentsHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/vendors/{vendor_id}/comments:
 *   get:
 *     summary: Get comments for a vendor
 *     tags: [VendorComments]
 *     responses:
 *       200:
 *         description: List of comments
 */
export default getCommentsHandler({
    resourceTable: vendors,
    dbQueryKey: 'vendors',
    resourceIdParam: 'vendor_id',
    foreignKeyField: 'vendorId'
});
