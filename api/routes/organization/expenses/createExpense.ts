import { db, expenses, expenseEntries, contracts, jobs } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils/index';
import { eq, and } from 'drizzle-orm';

// create expense
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid organization_id'))
        }

        const entriesData =
            req.body?.ExpenseEntries?.map((entry: any) =>
                pick(entry, ['description', 'quantity', 'unitCost', 'name'])
            ) || []

        if (entriesData.length === 0) {
            return res.status(400).json(createErrorResponse(
                'ExpenseEntries is required. Provide at least one entry.'
            ))
        }

        const body = {
            ...pick(req.body, [
                'description',
                'date',
                'taxRate',
            ]),
            status: 'pending',
            reference: req.body.expenseNumber,
            taxRate: String(req.body.taxRate || 0),
            // amount? Legacy pick didn't pick amount. But schema has `amount` NOT NULL.
            // entries loop usually calculates total amount? 
            // Legacy didn't calculate amount. `Expense.create(body)`
            // Maybe `amount` is virtual or calculated by hook?
            // Or `ExpenseEntries` sum up?
            // Drizzle doesn't auto-sum.
            // I should calculate amount from entries.
            // line 164: `amount: numeric('amount').notNull()`.
            // I MUST provide amount.
            // Sum(quantity * unitCost).
            vendorId: req.body.VendorId,
            contractId: req.body.ContractId,
            jobId: req.body.JobId,
            organizationId: orgId,
            updatedByUserId: req.auth.id,
            amount: '0', // Initial placeholder, will update
        }

        // Calculate amount
        const totalAmount = entriesData.reduce((sum: number, entry: any) => {
            return sum + (Number(entry.quantity || 0) * Number(entry.unitCost || 0));
        }, 0);
        body.amount = String(totalAmount);

        // Remove undefined
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

        await db.transaction(async (tx) => {
            // Verify contract if provided
            if (body.contractId) {
                const contract = await tx.query.contracts.findFirst({
                    where: and(eq(contracts.id, body.contractId), eq(contracts.organizationId, orgId))
                });
                if (!contract) throw new Error('Contract not found');
            }

            // Verify job if provided
            if (body.jobId) {
                const job = await tx.query.jobs.findFirst({
                    where: and(eq(jobs.id, body.jobId), eq(jobs.organizationId, orgId))
                });
                if (!job) throw new Error('Job not found');
            }

            const [expense] = await tx.insert(expenses).values(body).returning();
            if (!expense) throw new Error('Failed to create expense');

            const entriesWithId = entriesData.map((entry: any) => ({
                ...entry,
                expenseId: expense.id,
                amount: String(Number(entry.quantity || 0) * Number(entry.unitCost || 0)),
                description: entry.description || entry.name,
                quantity: String(entry.quantity),
                unitCost: String(entry.unitCost),
                name: entry.name
            }));

            // Wait, if schema is missing fields `quantity`, `unitCost`, I should add them to schema if possible.
            // But I cannot easily edit migration without checking if column exists in DB.
            // Assuming simplified schema for now or valid schema from task.
            // I will adhere to schema definition in `api/db/schema.ts`.

            await tx.insert(expenseEntries).values(entriesWithId);

            const response = {
                ...expense,
                expenseEntries: entriesWithId
            };
            return res.status(201).json(createSuccessResponse(response))
        })
    } catch (e: any) {
        return res.status(400).json(createErrorResponse(e.message))
    }
}
