import { clients } from '../../../../../db';
import { deleteAttachmentHandler } from '../../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/clients/{client_id}/comments/{comment_id}/attachments/{attachment_id}:
 *   delete:
 *     summary: Delete an attachment from a client comment
 *     tags: [ClientComments]
 *     responses:
 *       200:
 *         description: Attachment deleted
 */
export default deleteAttachmentHandler({
    resourceTable: clients,
    dbQueryKey: 'clients',
    resourceIdParam: 'client_id',
    foreignKeyField: 'clientId' // needed? factories signature says no, but let's check definition
});
