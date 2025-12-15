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
        if (!contractId || !(0, isValidUUID_1.isValidUUID)(contractId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invalid contract id.'));
        }
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        }
        const body = {
            ...(0, utils_1.pick)(req.body, ['content']),
            contractId: contractId,
            authorId: req.auth.id,
            updatedByUserId: req.auth.id,
            organizationId: orgId,
        };
        // Validate contract
        const contract = await db_1.db.query.contracts.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.contracts.id, contractId), (0, drizzle_orm_1.eq)(db_1.contracts.organizationId, orgId))
        });
        if (!contract) {
            return res.status(400).json((0, response_1.createErrorResponse)('Contract not found.'));
        }
        const files = req.files;
        if ((!files || files.length <= 0) &&
            (!body.content || body.content.length === 0)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Content cannot be empty if there are no attachments.'));
        }
        // Create comment
        // Transaction? Legacy used transaction for S3 metadata storage.
        // We can wrap in db.transaction if needed. 
        // Although S3 upload is outside DB transaction usually, but here metadata is inside.
        await db_1.db.transaction(async (tx) => {
            const [comment] = await tx.insert(db_1.comments).values(body).returning();
            if (!comment) {
                throw new Error('Failed to create comment.');
            }
            let savedAttachments = null;
            if (files && files.length > 0) {
                const attachmentsData = files.map((file) => {
                    file.key = uuid_1.default.v4();
                    const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`;
                    return {
                        id: file.key, // Should be UUID? file.key is UUID from UUID.v4()
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size,
                        accessUrl,
                        commentId: comment.id,
                    };
                });
                savedAttachments = await tx.insert(db_1.attachments).values(attachmentsData).returning();
                // Upload to S3
                for (const file of files) {
                    await s3_1.default.upload(file, file.key);
                }
            }
            // Return comment with attachments
            // Legacy structured `comment.dataValues.Attachments = attachments`.
            // We return plain object.
            const response = {
                ...comment,
                attachments: savedAttachments
            };
            return res.json((0, response_1.createSuccessResponse)(response));
        });
    }
    catch (error) {
        return res
            .status(400)
            .json((0, response_1.createErrorResponse)('An error occurred.', error));
    }
};
