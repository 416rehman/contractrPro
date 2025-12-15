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
        const vendorId = req.params.vendor_id;
        const orgId = req.params.org_id;
        const commentId = req.params.comment_id;
        if (!vendorId || !(0, isValidUUID_1.isValidUUID)(vendorId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid vendor id.'));
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        if (!commentId || !(0, isValidUUID_1.isValidUUID)(commentId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid comment id.'));
        const body = {
            ...(0, utils_1.pick)(req.body, ['content']),
            // UpdatedByUserId: req.auth.id,
        };
        await db_1.db.transaction(async (tx) => {
            // make sure the vendor belongs to the org
            const vendor = await tx.query.vendors.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.vendors.id, vendorId), (0, drizzle_orm_1.eq)(db_1.vendors.organizationId, orgId))
            });
            if (!vendor) {
                return res.status(400).json((0, response_1.createErrorResponse)('Vendor not found.'));
            }
            // check if the comment currently has attachments
            const commentAttachments = await tx.query.attachments.findMany({
                where: (0, drizzle_orm_1.eq)(db_1.attachments.commentId, commentId)
            });
            const currentAttachmentsCount = commentAttachments.length;
            const files = req.files;
            if ((!files || files.length <= 0) &&
                (!body.content || body.content.length === 0)) {
                if (currentAttachmentsCount === 0) {
                    return res.status(400).json((0, response_1.createErrorResponse)('Content cannot be empty if there are no attachments.'));
                }
            }
            // Update the comment
            const [comment] = await tx.update(db_1.comments)
                .set(body)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.comments.id, commentId), (0, drizzle_orm_1.eq)(db_1.comments.organizationId, orgId), (0, drizzle_orm_1.eq)(db_1.comments.vendorId, vendorId)))
                .returning();
            if (!comment) {
                return res.status(400).json((0, response_1.createErrorResponse)('Failed to update comment.'));
            }
            let createdAttachments = null;
            // Check if there are any new attachments
            if (files && files.length > 0) {
                // Process attachments
                const attachmentsData = files.map((file) => {
                    file.key = uuid_1.default.v4();
                    // https://[bucket-name].s3.[region-code].amazonaws.com/[key-name]
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
                // Store the attachments metadata in the database
                createdAttachments = await tx.insert(db_1.attachments).values(attachmentsData).returning();
                if (!createdAttachments) {
                    return res.status(400).json((0, response_1.createErrorResponse)('Failed to create attachments.'));
                }
                // upload the attachments to s3Vendor
                for (const file of files) {
                    await s3_1.default.upload(file, file.key);
                }
            }
            return res.json((0, response_1.createSuccessResponse)(comment));
        });
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('An error occurred.', error));
    }
};
