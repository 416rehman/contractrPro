"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
// Retrieves all users with pagination
exports.default = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const limitNum = parseInt(limit);
        const offsetNum = (parseInt(page) - 1) * limitNum;
        const userList = await db_1.db.query.users.findMany({
            limit: limitNum,
            offset: offsetNum,
            columns: {
                id: true,
                username: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                // avatarUrl: true, // TODO: verify in schema
            }
        });
        const [totalCount] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.users);
        const totalPages = Math.ceil(totalCount.count / limitNum);
        const response = {
            users: userList,
            currentPage: parseInt(page),
            totalPages,
        };
        return res.status(200).json((0, response_1.createSuccessResponse)(response));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
