import { clients } from '../../../../db';
import { deleteCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/clients/{client_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete a client comment
 *     tags: [ClientComments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default deleteCommentHandler({
    resourceTable: clients,
    dbQueryKey: 'clients',
    resourceIdParam: 'client_id',
    foreignKeyField: 'clientId'
});
