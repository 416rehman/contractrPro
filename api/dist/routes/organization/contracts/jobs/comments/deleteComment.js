"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../../../utils/response");
const db_1 = require("../../../../../db");
const isValidUUID_1 = require("../../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Deletes a comment
exports.default = async (req, res) => {
    try {
        const commentId = req.params.comment_id;
        const jobId = req.params.job_id;
        const orgId = req.params.org_id;
        const contractId = req.params.contract_id;
        if (!commentId || !(0, isValidUUID_1.isValidUUID)(commentId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid comment id.'));
        if (!jobId || !(0, isValidUUID_1.isValidUUID)(jobId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid job id.'));
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        if (!contractId || !(0, isValidUUID_1.isValidUUID)(contractId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid contract id.'));
        await db_1.db.transaction(async (tx) => {
            // make sure the contract belongs to the organization
            const contract = await tx.query.contracts.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId))
            });
            if (!contract) {
                return res.status(400).json((0, response_1.createErrorResponse)('Contract not found.'));
            }
            const job = await tx.query.jobs.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.id, jobId), (0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractId))
            });
            if (!job) {
                return res.status(400).json((0, response_1.createErrorResponse)('Job not found.'));
            }
            // Delete the comment
            const deleted = await tx.delete(db_1.comments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.comments.id, commentId), (0, drizzle_orm_1.eq)(db_1.comments.jobId, jobId), (0, drizzle_orm_1.eq)(db_1.comments.organizationId, orgId)))
                .returning();
            if (!deleted.length) {
                // If standard delete, returning empty if not found. Legacy checked count.
            }
            return res.status(200).json((0, response_1.createSuccessResponse)(deleted.length));
        });
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('Failed to delete comment.'));
    }
};
