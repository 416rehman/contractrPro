import { contracts } from '../../../../../db';
import { deleteAttachmentHandler } from '../../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/comments/{comment_id}/attachments/{attachment_id}:
 *   delete:
 *     summary: Delete an attachment from a contract comment
 *     tags: [ContractComments]
 *     responses:
 *       200:
 *         description: Attachment deleted
 */
export default deleteAttachmentHandler({
    resourceTable: contracts,
    dbQueryKey: 'contracts',
    resourceIdParam: 'contract_id',
    foreignKeyField: 'contractId'
});
