import { db, jobs, contracts } from '../../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs:
 *   post:
 *     summary: Create a job
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Job created
 */
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id

        if (!orgID || !isValidUUID(orgID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (!contractID || !isValidUUID(contractID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        }

        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractID), eq(contracts.organizationId, orgID))
        })

        if (!contract) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        const body = {
            ...pick(req.body, ['identifier', 'name', 'description', 'status']),
            contractId: contractID,
            organizationId: orgID,
            updatedByUserId: req.auth.id,
        }

        const [createJob] = await db.insert(jobs).values(body).returning();

        return res.status(200).json(createSuccessResponse(createJob))
    } catch (error) {
        res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

