import { expenses } from '../../../../../db';
import { deleteAttachmentHandler } from '../../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/expenses/{expense_id}/comments/{comment_id}/attachments/{attachment_id}:
 *   delete:
 *     summary: Delete an attachment from an expense comment
 *     tags: [ExpenseComments]
 *     responses:
 *       200:
 *         description: Attachment deleted
 */
export default deleteAttachmentHandler({
    resourceTable: expenses,
    dbQueryKey: 'expenses',
    resourceIdParam: 'expense_id',
    foreignKeyField: 'expenseId'
});
