"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../../db");
const response_1 = require("../../../../../utils/response");
const isValidUUID_1 = require("../../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const jobId = req.params.job_id;
        const contractId = req.params.contract_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        if (!jobId || !(0, isValidUUID_1.isValidUUID)(jobId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid job id.'));
        if (!contractId || !(0, isValidUUID_1.isValidUUID)(contractId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid contract id.'));
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        // Verify contract and job existence
        const contract = await db_1.db.query.contracts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId))
        });
        if (!contract)
            return res.status(400).json((0, response_1.createErrorResponse)('Contract not found.'));
        const job = await db_1.db.query.jobs.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractId))
        });
        if (!job)
            return res.status(400).json((0, response_1.createErrorResponse)('Job not found.'));
        // Get the comments
        const commentsList = await db_1.db.query.comments.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.comments.jobId, jobId),
            with: {
                attachments: true
            },
            limit: limitNum,
            offset: offset,
            orderBy: (0, drizzle_orm_1.desc)(db_1.comments.createdAt)
        });
        const totalCountResult = await db_1.db.select({ count: (0, drizzle_orm_1.count)() })
            .from(db_1.comments)
            .where((0, drizzle_orm_1.eq)(db_1.comments.jobId, jobId));
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
