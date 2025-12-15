"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../../../utils/response");
const db_1 = require("../../../../../db");
const isValidUUID_1 = require("../../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const attachmentId = req.params.attachment_id;
        const commentId = req.params.comment_id;
        const clientId = req.params.client_id;
        const orgId = req.params.org_id;
        if (!attachmentId || !(0, isValidUUID_1.isValidUUID)(attachmentId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid attachment id.'));
        if (!commentId || !(0, isValidUUID_1.isValidUUID)(commentId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid comment id.'));
        if (!clientId || !(0, isValidUUID_1.isValidUUID)(clientId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid client id.'));
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        await db_1.db.transaction(async (tx) => {
            // make sure the client belongs to the org
            const client = await tx.query.clients.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.clients.id, clientId), (0, drizzle_orm_1.eq)(db_1.clients.organizationId, orgId))
            });
            if (!client) {
                return res.status(400).json((0, response_1.createErrorResponse)('Client not found.'));
            }
            // Remove the attachment
            const deleted = await tx.delete(db_1.attachments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.attachments.id, attachmentId), (0, drizzle_orm_1.eq)(db_1.attachments.commentId, commentId)))
                .returning();
            if (deleted.length > 0) {
                const comment = await tx.query.comments.findFirst({
                    where: (0, drizzle_orm_1.eq)(db_1.comments.id, commentId),
                    with: {
                        attachments: true
                    }
                });
                if (comment) {
                    if ((!comment.content || comment.content.trim() === '') && comment.attachments.length === 0) {
                        await tx.delete(db_1.comments).where((0, drizzle_orm_1.eq)(db_1.comments.id, commentId));
                    }
                }
            }
            return res.json((0, response_1.createSuccessResponse)(deleted.length));
        });
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('An error occurred.', error));
    }
};
