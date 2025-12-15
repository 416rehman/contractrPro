import { expenses } from '../../../../db';
import { createCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/expenses/{expense_id}/comments:
 *   post:
 *     summary: Create a comment on an expense
 *     tags: [ExpenseComments]
 *     responses:
 *       200:
 *         description: Comment created
 */
export default createCommentHandler({
    resourceTable: expenses,
    dbQueryKey: 'expenses',
    resourceIdParam: 'expense_id',
    foreignKeyField: 'expenseId'
});
