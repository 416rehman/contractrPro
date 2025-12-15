"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../../../../utils/response");
const db_1 = require("../../../../../../db");
const isValidUUID_1 = require("../../../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// delete attachment
exports.default = async (req, res) => {
    try {
        const commentId = req.params.comment_id;
        const jobId = req.params.job_id;
        const orgId = req.params.org_id;
        const attachmentId = req.params.attachment_id;
        if (!commentId || !(0, isValidUUID_1.isValidUUID)(commentId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid comment id.'));
        if (!jobId || !(0, isValidUUID_1.isValidUUID)(jobId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid job id.'));
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        if (!attachmentId || !(0, isValidUUID_1.isValidUUID)(attachmentId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid attachment id.'));
        await db_1.db.transaction(async (tx) => {
            // Make sure the Comment belongs to the Job
            const comment = await tx.query.comments.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.comments.id, commentId), (0, drizzle_orm_1.eq)(db_1.comments.organizationId, orgId), (0, drizzle_orm_1.eq)(db_1.comments.jobId, jobId))
            });
            if (!comment) {
                return res.status(400).json((0, response_1.createErrorResponse)('Comment/Attachment not found (comment).'));
            }
            // Find all attachments for the comment
            const allAttachments = await tx.query.attachments.findMany({
                where: (0, drizzle_orm_1.eq)(db_1.attachments.commentId, commentId)
            });
            // Ensure the attachment exists in the list
            const attachmentToDelete = allAttachments.find(a => a.id === attachmentId);
            if (!attachmentToDelete) {
                return res.status(400).json((0, response_1.createErrorResponse)('Attachment not found.'));
            }
            let rowsDeleted = 0;
            // if the comment has no content and this is the last attachment, delete the comment
            if ((!comment.content || comment.content === '') &&
                allAttachments.length === 1) {
                const deletedComments = await tx.delete(db_1.comments)
                    .where((0, drizzle_orm_1.eq)(db_1.comments.id, commentId))
                    .returning();
                rowsDeleted = deletedComments.length > 0 ? 1 : 0;
                rowsDeleted += 1; // add 1 for the attachment implicitly
            }
            else {
                const deletedAttachments = await tx.delete(db_1.attachments)
                    .where((0, drizzle_orm_1.eq)(db_1.attachments.id, attachmentId))
                    .returning();
                rowsDeleted = deletedAttachments.length;
            }
            return res.status(200).json((0, response_1.createSuccessResponse)(rowsDeleted));
        });
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('Failed to delete attachment.', err));
    }
};
