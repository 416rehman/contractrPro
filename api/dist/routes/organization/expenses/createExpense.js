"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const index_1 = require("../../../utils/index");
const drizzle_orm_1 = require("drizzle-orm");
// create expense
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid organization_id'));
        }
        const entriesData = req.body?.ExpenseEntries?.map((entry) => (0, index_1.pick)(entry, ['description', 'quantity', 'unitCost', 'name'])) || [];
        if (entriesData.length === 0) {
            return res.status(400).json((0, response_1.createErrorResponse)('ExpenseEntries is required. Provide at least one entry.'));
        }
        const body = {
            ...(0, index_1.pick)(req.body, [
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
        };
        // Calculate amount
        const totalAmount = entriesData.reduce((sum, entry) => {
            return sum + (Number(entry.quantity || 0) * Number(entry.unitCost || 0));
        }, 0);
        body.amount = String(totalAmount);
        // Remove undefined
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);
        await db_1.db.transaction(async (tx) => {
            // Verify contract if provided
            if (body.contractId) {
                const contract = await tx.query.contracts.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, body.contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId))
                });
                if (!contract)
                    throw new Error('Contract not found');
            }
            // Verify job if provided
            if (body.jobId) {
                const job = await tx.query.jobs.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, body.jobId), (0, drizzle_orm_1.eq)(db_1.jobs.organizationId, orgId))
                });
                if (!job)
                    throw new Error('Job not found');
            }
            const [expense] = await tx.insert(db_1.expenses).values(body).returning();
            if (!expense)
                throw new Error('Failed to create expense');
            const entriesWithId = entriesData.map((entry) => ({
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
            await tx.insert(db_1.expenseEntries).values(entriesWithId);
            const response = {
                ...expense,
                expenseEntries: entriesWithId
            };
            return res.status(201).json((0, response_1.createSuccessResponse)(response));
        });
    }
    catch (e) {
        return res.status(400).json((0, response_1.createErrorResponse)(e.message));
    }
};
