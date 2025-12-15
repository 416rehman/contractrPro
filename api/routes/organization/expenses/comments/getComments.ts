import { expenses } from '../../../../db';
import { getCommentsHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/expenses/{expense_id}/comments:
 *   get:
 *     summary: Get comments for an expense
 *     tags: [ExpenseComments]
 *     responses:
 *       200:
 *         description: List of comments
 */
export default getCommentsHandler({
    resourceTable: expenses,
    dbQueryKey: 'expenses',
    resourceIdParam: 'expense_id',
    foreignKeyField: 'expenseId'
});
