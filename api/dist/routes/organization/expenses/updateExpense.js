"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const index_1 = require("../../../utils/index");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const { org_id, expense_id } = req.params;
        if (!org_id || !(0, isValidUUID_1.isValidUUID)(org_id))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org_id'));
        if (!expense_id || !(0, isValidUUID_1.isValidUUID)(expense_id))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid expense_id'));
        const entriesData = req.body?.ExpenseEntries?.map((entry) => (0, index_1.pick)(entry, ['description', 'quantity', 'unitCost', 'name'])) || [];
        if (entriesData.length === 0) {
            return res.status(400).json((0, response_1.createErrorResponse)('ExpenseEntries is required.'));
        }
        const body = {
            ...(0, index_1.pick)(req.body, [
                'description',
                'date',
                'taxRate',
                'VendorId',
                'ContractId',
                'JobId',
            ]),
            // Map keys
            vendorId: req.body.VendorId,
            contractId: req.body.ContractId,
            jobId: req.body.JobId,
            organizationId: org_id,
            updatedByUserId: req.auth.id,
            amount: '0'
        };
        // Clean
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);
        // Calculate amount
        const totalAmount = entriesData.reduce((sum, entry) => {
            return sum + (Number(entry.quantity || 0) * Number(entry.unitCost || 0));
        }, 0);
        body.amount = String(totalAmount);
        await db_1.db.transaction(async (tx) => {
            const expense = await tx.query.expenses.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.expenses.id, expense_id), (0, drizzle_orm_1.eq)(db_1.expenses.organizationId, org_id))
            });
            if (!expense)
                throw new Error('Expense not found');
            await tx.update(db_1.expenses).set(body).where((0, drizzle_orm_1.eq)(db_1.expenses.id, expense.id));
            if (entriesData.length > 0) {
                await tx.delete(db_1.expenseEntries).where((0, drizzle_orm_1.eq)(db_1.expenseEntries.expenseId, expense.id));
                const entriesWithId = entriesData.map((entry) => ({
                    ...entry,
                    expenseId: expense.id,
                    amount: String(Number(entry.quantity || 0) * Number(entry.unitCost || 0)),
                    description: entry.description || entry.name,
                    updatedByUserId: req.auth.id
                }));
                await tx.insert(db_1.expenseEntries).values(entriesWithId);
            }
            const updated = await tx.query.expenses.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.expenses.id, expense.id),
                with: {
                    expenseEntries: true
                }
            });
            return res.status(200).json((0, response_1.createSuccessResponse)(updated));
        });
    }
    catch (e) {
        return res.status(400).json((0, response_1.createErrorResponse)(e.message || 'Error'));
    }
};
