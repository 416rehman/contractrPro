"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../../utils/response");
const db_1 = require("../../../../db");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// get expense entries
exports.default = async (req, res) => {
    try {
        const expenseId = req.params.expense_id;
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid organization_id'));
        if (!expenseId || !(0, isValidUUID_1.isValidUUID)(expenseId))
            return res.status(400).json((0, response_1.createErrorResponse)('Expense ID is required'));
        // make sure the expense belongs to the org
        const expense = await db_1.db.query.expenses.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.expenses.id, expenseId), (0, drizzle_orm_1.eq)(db_1.expenses.organizationId, orgId))
        });
        if (!expense) {
            return res.status(400).json((0, response_1.createErrorResponse)('Expense not found'));
        }
        const entries = await db_1.db.query.expenseEntries.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.expenseEntries.expenseId, expenseId)
        });
        res.status(200).json((0, response_1.createSuccessResponse)(entries));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
