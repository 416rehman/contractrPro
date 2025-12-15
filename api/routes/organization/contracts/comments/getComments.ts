import { contracts } from '../../../../db';
import { getCommentsHandler } from '../../../common/comments/factory';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/comments:
 *   get:
 *     summary: Get comments for a contract
 *     tags: [ContractComments]
 *     responses:
 *       200:
 *         description: List of comments
 */
export default getCommentsHandler({
    resourceTable: contracts,
    dbQueryKey: 'contracts',
    resourceIdParam: 'contract_id',
    foreignKeyField: 'contractId'
});
