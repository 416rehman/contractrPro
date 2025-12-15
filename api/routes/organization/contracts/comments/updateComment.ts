import { contracts } from '../../../../db';
import { updateCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/comments/{comment_id}:
 *   patch:
 *     summary: Update a contract comment
 *     tags: [ContractComments]
 *     responses:
 *       200:
 *         description: Comment updated
 */
export default updateCommentHandler({
    resourceTable: contracts,
    dbQueryKey: 'contracts',
    resourceIdParam: 'contract_id',
    foreignKeyField: 'contractId'
});
