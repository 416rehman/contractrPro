"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// DELETE /organizations/:org_id/contracts/:contract_id/expenses/:expense_id
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const expenseId = req.params.expense_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Organization ID is required'));
        if (!expenseId || !(0, isValidUUID_1.isValidUUID)(expenseId))
            return res.status(400).json((0, response_1.createErrorResponse)('Expense ID is required'));
        const deleted = await db_1.db.delete(db_1.expenses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.expenses.id, expenseId), (0, drizzle_orm_1.eq)(db_1.expenses.organizationId, orgId)))
            .returning();
        if (!deleted.length) {
            return res.status(400).json((0, response_1.createErrorResponse)('Expense not found'));
        }
        res.status(200).json((0, response_1.createSuccessResponse)(deleted.length));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
