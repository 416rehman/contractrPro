import { db, contracts } from '../../../db';
import { isValidUUID } from '../../../utils/isValidUUID';
import { ErrorCode } from '../../../utils/errorCodes';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts:
 *   get:
 *     summary: Get all contracts for an organization
 *     tags: [Contracts]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Organization ID
 *       - in: query
 *         name: expand
 *         schema:
 *           type: boolean
 *         description: Include jobs and their assignees
 *     responses:
 *       200:
 *         description: List of contracts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid or missing org ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
export default async (req, res) => {
    try {
        const expand = req.query.expand
        const orgID = req.params.org_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const queryOptions: any = {
            where: eq(contracts.organizationId, orgID)
        };

        if (expand) {
            queryOptions.with = {
                jobs: {
                    with: {
                        jobMembers: true
                    }
                }
            }
        }

        const organizationContracts = await db.query.contracts.findMany(queryOptions);

        // transform to legacy shape if expanded
        if (expand && organizationContracts) {
            organizationContracts.forEach((contract: any) => {
                if (contract.jobs) {
                    contract.jobs.forEach((job: any) => {
                        if (job.jobMembers) {
                            job.assignedTo = job.jobMembers.map((jm: any) => jm.organizationMemberId);
                            delete job.jobMembers;
                        }
                    })
                }
            })
        }

        return res
            .status(200)
            .json(createSuccessResponse(organizationContracts))
    } catch (error) {
        res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

