import { contracts } from '../../../../db';
import { deleteCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete a contract comment
 *     tags: [ContractComments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default deleteCommentHandler({
    resourceTable: contracts,
    dbQueryKey: 'contracts',
    resourceIdParam: 'contract_id',
    foreignKeyField: 'contractId'
});
