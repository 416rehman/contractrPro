"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// DELETE /organizations/:org_id/contracts/:contract_id/expenses/:expense_id/invoiceEntries/:expenseEntry_id
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const expenseId = req.params.expense_id;
        const expenseEntryId = req.params.entry_id;
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid organization_id'));
        if (!expenseId || !(0, isValidUUID_1.isValidUUID)(expenseId))
            return res.status(400).json((0, response_1.createErrorResponse)('Expense ID is required'));
        if (!expenseEntryId || !(0, isValidUUID_1.isValidUUID)(expenseEntryId))
            return res.status(400).json((0, response_1.createErrorResponse)('ExpenseEntry ID is required'));
        await db_1.db.transaction(async (tx) => {
            // make sure the expense belongs to the org
            const expense = await tx.query.expenses.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.expenses.id, expenseId), (0, drizzle_orm_1.eq)(db_1.expenses.organizationId, orgId))
            });
            if (!expense) {
                return res.status(400).json((0, response_1.createErrorResponse)('Expense not found'));
            }
            const deleted = await tx.delete(db_1.expenseEntries)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.expenseEntries.expenseId, expenseId), (0, drizzle_orm_1.eq)(db_1.expenseEntries.id, expenseEntryId)))
                .returning();
            if (!deleted.length) {
                return res.status(400).json((0, response_1.createErrorResponse)('ExpenseEntry not found'));
            }
            res.status(200).json((0, response_1.createSuccessResponse)(deleted.length));
        });
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
