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
        const contractId = req.params.contract_id;
        const orgId = req.params.org_id;
        if (!commentId || !(0, isValidUUID_1.isValidUUID)(commentId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid comment id.'));
        if (!contractId || !(0, isValidUUID_1.isValidUUID)(contractId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid contract id.'));
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        const contract = await db_1.db.query.contracts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId))
        });
        if (!contract)
            return res.status(400).json((0, response_1.createErrorResponse)('Contract not found.'));
        // Delete matches legacy conditions
        const deleted = await db_1.db.delete(db_1.comments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.comments.id, commentId), (0, drizzle_orm_1.eq)(db_1.comments.contractId, contractId), (0, drizzle_orm_1.eq)(db_1.comments.organizationId, orgId)))
            .returning();
        return res.status(200).json((0, response_1.createSuccessResponse)(deleted.length)); // Legacy returned count/result
    }
    catch (err) {
        return res
            .status(400)
            .json((0, response_1.createErrorResponse)('Failed to delete comment.'));
    }
};
