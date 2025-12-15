import { clients } from '../../../../db';
import { createCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/clients/{client_id}/comments:
 *   post:
 *     summary: Create a comment on a client
 *     tags: [ClientComments]
 *     responses:
 *       200:
 *         description: Comment created
 */
export default createCommentHandler({
    resourceTable: clients,
    dbQueryKey: 'clients',
    resourceIdParam: 'client_id',
    foreignKeyField: 'clientId'
});
