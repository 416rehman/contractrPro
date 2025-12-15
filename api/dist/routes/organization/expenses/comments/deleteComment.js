"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../../utils/response");
const db_1 = require("../../../../db");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Deletes a comment
exports.default = async (req, res) => {
    try {
        const commentId = req.params.comment_id;
        const expenseId = req.params.expense_id;
        const orgId = req.params.org_id;
        if (!commentId || !(0, isValidUUID_1.isValidUUID)(commentId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid comment id.'));
        if (!expenseId || !(0, isValidUUID_1.isValidUUID)(expenseId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid expense id.'));
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        await db_1.db.transaction(async (tx) => {
            // make sure the expense belongs to the org
            const expense = await tx.query.expenses.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.expenses.id, expenseId), (0, drizzle_orm_1.eq)(db_1.expenses.organizationId, orgId))
            });
            if (!expense) {
                return res.status(400).json((0, response_1.createErrorResponse)('Expense not found.'));
            }
            // Delete the comment
            const deleted = await tx.delete(db_1.comments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.comments.id, commentId), (0, drizzle_orm_1.eq)(db_1.comments.expenseId, expenseId), (0, drizzle_orm_1.eq)(db_1.comments.organizationId, orgId)))
                .returning();
            if (!deleted.length) {
                // If standard delete, returning empty if not found. Legacy checked count.
            }
            return res.status(200).json((0, response_1.createSuccessResponse)(deleted.length)); // Sending count
        });
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('Failed to delete comment.', err));
    }
};
