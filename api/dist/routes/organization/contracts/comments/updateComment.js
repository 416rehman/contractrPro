"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../../utils/response");
const uuid_1 = __importDefault(require("uuid"));
const utils_1 = require("../../../../utils");
const db_1 = require("../../../../db");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const s3_1 = __importDefault(require("../../../../utils/s3"));
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const contractId = req.params.contract_id;
        const orgId = req.params.org_id;
        const commentId = req.params.comment_id;
        if (!contractId || !(0, isValidUUID_1.isValidUUID)(contractId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid contract id.'));
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        if (!commentId || !(0, isValidUUID_1.isValidUUID)(commentId))
            res.status(400).json((0, response_1.createErrorResponse)('Invalid comment id.'));
        const body = {
            ...(0, utils_1.pick)(req.body, ['content']),
            updatedByUserId: req.auth.id,
        };
        const contract = await db_1.db.query.contracts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId))
        });
        if (!contract)
            return res.status(400).json((0, response_1.createErrorResponse)('Contract not found.'));
        await db_1.db.transaction(async (tx) => {
            // Check current attachments
            const currentAttachmentsResult = await tx.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.attachments).where((0, drizzle_orm_1.eq)(db_1.attachments.commentId, commentId));
            const currentAttachments = currentAttachmentsResult[0].count;
            const files = req.files;
            if ((!files || files.length > 0) &&
                (!body.content || body.content.length === 0)) {
                if (currentAttachments === 0) {
                    // Need to error
                    throw new Error('Content cannot be empty if there are no attachments.');
                }
            }
            // Update comment
            const [updated] = await tx.update(db_1.comments)
                .set(body)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.comments.id, commentId), (0, drizzle_orm_1.eq)(db_1.comments.organizationId, orgId), (0, drizzle_orm_1.eq)(db_1.comments.contractId, contractId)))
                .returning();
            if (!updated) {
                throw new Error('Failed to update comment.');
            }
            let savedAttachments = null;
            if (files && files.length > 0) {
                const attachmentsData = files.map((file) => {
                    file.key = uuid_1.default.v4();
                    const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`;
                    return {
                        id: file.key,
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size,
                        accessUrl,
                        commentId: commentId,
                    };
                });
                savedAttachments = await tx.insert(db_1.attachments).values(attachmentsData).returning();
                for (const file of files) {
                    await s3_1.default.upload(file, file.key);
                }
            }
            // To return full object including attachments?
            // Legacy returned `comment` object. It didn't explicitly reload attachments, but logic suggests client might want them.
            // `returnValue` logic in legacy didn't attach `attachments` in update unless newly created.
            // I'll return updated comment. 
            // If client needs attachments, they might need to fetch again or I can include new ones.
            // Legacy: `return res.json(createSuccessResponse(comment))`
            return res.json((0, response_1.createSuccessResponse)(updated));
        });
    }
    catch (error) {
        return res
            .status(400)
            .json((0, response_1.createErrorResponse)('An error occurred.', error));
    }
};
