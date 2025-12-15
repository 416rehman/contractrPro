"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const contractId = req.params.contract_id;
        const { page = 1, limit = 10 } = req.query;
        const optsLimit = parseInt(limit);
        const optsOffset = (parseInt(page) - 1) * optsLimit;
        // Verify contract
        const contract = await db_1.db.query.contracts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId))
        });
        if (!contract) {
            return res.status(400).json((0, response_1.createErrorResponse)('Contract not found.'));
        }
        // Get comments with pagination and count
        // Drizzle doesn't have `findAndCountAll`.
        // We do two queries.
        const whereClause = (0, drizzle_orm_1.eq)(db_1.comments.contractId, contractId);
        const totalResult = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.comments).where(whereClause);
        const total = totalResult[0].count;
        const results = await db_1.db.query.comments.findMany({
            where: whereClause,
            limit: optsLimit,
            offset: optsOffset,
            with: {
                attachments: true
            },
            orderBy: [(0, drizzle_orm_1.desc)(db_1.comments.createdAt)] // Legacy default usually created_at desc? Or asc?
            // Legacy didn't specify order, so default usage.
        });
        const totalPages = Math.ceil(total / optsLimit);
        const response = {
            comments: results,
            currentPage: parseInt(page),
            totalPages,
        };
        return res.status(200).json((0, response_1.createSuccessResponse)(response));
    }
    catch (err) {
        return res
            .status(400)
            .json((0, response_1.createErrorResponse)('An error occurred.', err));
    }
};
