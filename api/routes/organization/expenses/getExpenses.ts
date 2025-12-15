import { db, expenses } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// get all org expenses
export default async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const { contract_id, job_id, vendor_id } = req.query
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid organization_id'))
        if (contract_id && !isValidUUID(contract_id as string)) return res.status(400).json(createErrorResponse('Invalid contract_id'))
        if (job_id && !isValidUUID(job_id as string)) return res.status(400).json(createErrorResponse('Invalid job_id'))
        if (vendor_id && !isValidUUID(vendor_id as string)) return res.status(400).json(createErrorResponse('Invalid vendor_id'))

        const queryOptions: any = {
            where: and(
                eq(expenses.organizationId, orgId),
                contract_id ? eq(expenses.contractId, contract_id as string) : undefined,
                job_id ? eq(expenses.jobId, job_id as string) : undefined,
                vendor_id ? eq(expenses.vendorId, vendor_id as string) : undefined
            ),
            limit: parseInt(limit as string),
            offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        };

        if (req.query.expand) {
            queryOptions.with = {
                expenseEntries: true
            }
        }

        const results = await db.query.expenses.findMany(queryOptions);

        return res.status(200).json(createSuccessResponse(results))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
