import { expenses } from '../../../../db';
import { deleteCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/expenses/{expense_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete an expense comment
 *     tags: [ExpenseComments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default deleteCommentHandler({
    resourceTable: expenses,
    dbQueryKey: 'expenses',
    resourceIdParam: 'expense_id',
    foreignKeyField: 'expenseId'
});
