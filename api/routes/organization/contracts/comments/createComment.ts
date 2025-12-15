import { contracts } from '../../../../db';
import { createCommentHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/comments:
 *   post:
 *     summary: Create a comment on a contract
 *     tags: [ContractComments]
 *     responses:
 *       200:
 *         description: Comment created
 */
export default createCommentHandler({
    resourceTable: contracts,
    dbQueryKey: 'contracts',
    resourceIdParam: 'contract_id',
    foreignKeyField: 'contractId'
});
