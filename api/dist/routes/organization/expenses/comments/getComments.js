"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const expenseId = req.params.expense_id;
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        // make sure the expense belongs to the org
        const expense = await db_1.db.query.expenses.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.expenses.id, expenseId), (0, drizzle_orm_1.eq)(db_1.expenses.organizationId, orgId))
        });
        if (!expense) {
            return res.status(400).json((0, response_1.createErrorResponse)('Expense not found.'));
        }
        // Get the comments
        const commentsList = await db_1.db.query.comments.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.comments.expenseId, expenseId),
            with: {
                attachments: true
            },
            limit: limitNum,
            offset: offset,
            orderBy: (0, drizzle_orm_1.desc)(db_1.comments.createdAt)
        });
        const totalCountResult = await db_1.db.select({ count: (0, drizzle_orm_1.count)() })
            .from(db_1.comments)
            .where((0, drizzle_orm_1.eq)(db_1.comments.expenseId, expenseId));
        const totalCount = totalCountResult[0].count;
        const totalPages = Math.ceil(totalCount / limitNum);
        const response = {
            comments: commentsList,
            currentPage: pageNum,
            totalPages,
        };
        return res.status(200).json((0, response_1.createSuccessResponse)(response));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('An error occurred.', err));
    }
};
