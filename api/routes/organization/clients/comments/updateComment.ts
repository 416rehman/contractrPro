import { clients } from '../../../../db';
import { updateCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/clients/{client_id}/comments/{comment_id}:
 *   patch:
 *     summary: Update a client comment
 *     tags: [ClientComments]
 *     responses:
 *       200:
 *         description: Comment updated
 */
export default updateCommentHandler({
    resourceTable: clients,
    dbQueryKey: 'clients',
    resourceIdParam: 'client_id',
    foreignKeyField: 'clientId'
});
