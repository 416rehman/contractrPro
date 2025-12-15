import { db, expenses, expenseEntries, contracts, jobs } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils/index';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/expenses:
 *   post:
 *     summary: Create an expense
 *     tags: [Expenses]
 *     responses:
 *       201:
 *         description: Expense created
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const entriesData = req.body?.ExpenseEntries?.map((entry: any) =>
            pick(entry, ['description', 'quantity', 'unitCost', 'name'])
        ) || []

        if (entriesData.length === 0) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        const body = {
            ...pick(req.body, ['description', 'date', 'taxRate']),
            status: 'pending',
            reference: req.body.expenseNumber,
            taxRate: String(req.body.taxRate || 0),
            vendorId: req.body.VendorId,
            contractId: req.body.ContractId,
            jobId: req.body.JobId,
            organizationId: orgId,
            updatedByUserId: req.auth.id,
            amount: '0',
        }

        const totalAmount = entriesData.reduce((sum: number, entry: any) => {
            return sum + (Number(entry.quantity || 0) * Number(entry.unitCost || 0));
        }, 0);
        body.amount = String(totalAmount);

        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

        await db.transaction(async (tx) => {
            if (body.contractId) {
                const contract = await tx.query.contracts.findFirst({
                    where: and(eq(contracts.id, body.contractId), eq(contracts.organizationId, orgId))
                });
                if (!contract) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));
            }

            if (body.jobId) {
                const job = await tx.query.jobs.findFirst({
                    where: and(eq(jobs.id, body.jobId), eq(jobs.organizationId, orgId))
                });
                if (!job) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));
            }

            const [expense] = await tx.insert(expenses).values(body).returning();
            if (!expense) return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR));

            const entriesWithId = entriesData.map((entry: any) => ({
                ...entry,
                expenseId: expense.id,
                amount: String(Number(entry.quantity || 0) * Number(entry.unitCost || 0)),
                description: entry.description || entry.name,
                quantity: String(entry.quantity),
                unitCost: String(entry.unitCost),
                name: entry.name
            }));

            await tx.insert(expenseEntries).values(entriesWithId);

            const response = { ...expense, expenseEntries: entriesWithId };
            return res.status(201).json(createSuccessResponse(response))
        })
    } catch (e: any) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}

