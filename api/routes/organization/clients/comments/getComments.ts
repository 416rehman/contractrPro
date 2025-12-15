import { clients } from '../../../../db';
import { getCommentsHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/clients/{client_id}/comments:
 *   get:
 *     summary: Get comments for a client
 *     tags: [ClientComments]
 *     responses:
 *       200:
 *         description: List of comments
 */
export default getCommentsHandler({
    resourceTable: clients,
    dbQueryKey: 'clients',
    resourceIdParam: 'client_id',
    foreignKeyField: 'clientId'
});
