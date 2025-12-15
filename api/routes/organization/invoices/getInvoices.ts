import { db, invoices } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/invoices:
 *   get:
 *     summary: Get all invoices for an organization
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: List of invoices
 */
export default async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const { contract_id, job_id, client_id } = req.query
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (contract_id && !isValidUUID(contract_id as string)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (job_id && !isValidUUID(job_id as string)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (client_id && !isValidUUID(client_id as string)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const queryOptions: any = {
            where: and(
                eq(invoices.organizationId, orgId),
                contract_id ? eq(invoices.contractId, contract_id as string) : undefined,
                job_id ? eq(invoices.jobId, job_id as string) : undefined,
                client_id ? eq(invoices.billToClientId, client_id as string) : undefined
            ),
            limit: parseInt(limit as string),
            offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        };

        if (req.query.expand) {
            queryOptions.with = { invoiceEntries: true }
        }

        const results = await db.query.invoices.findMany(queryOptions);
        return res.status(200).json(createSuccessResponse(results))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
