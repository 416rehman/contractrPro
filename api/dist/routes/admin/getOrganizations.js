"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
// Retrieves all organizations with pagination
exports.default = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        const organizationsList = await db_1.db.query.organizations.findMany({
            limit: limitNum,
            offset: offset
        });
        const totalCountResult = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.organizations);
        const totalCount = totalCountResult[0].count;
        const totalPages = Math.ceil(totalCount / limitNum);
        const response = {
            organizations: organizationsList,
            currentPage: pageNum,
            totalPages,
        };
        return res.status(200).json((0, response_1.createSuccessResponse)(response));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
