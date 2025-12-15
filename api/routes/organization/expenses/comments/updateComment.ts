import { expenses } from '../../../../db';
import { updateCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/expenses/{expense_id}/comments/{comment_id}:
 *   patch:
 *     summary: Update an expense comment
 *     tags: [ExpenseComments]
 *     responses:
 *       200:
 *         description: Comment updated
 */
export default updateCommentHandler({
    resourceTable: expenses,
    dbQueryKey: 'expenses',
    resourceIdParam: 'expense_id',
    foreignKeyField: 'expenseId'
});
