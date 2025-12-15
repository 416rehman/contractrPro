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
        const expenseId = req.params.expense_id;
        const orgId = req.params.org_id;
        if (!expenseId || !(0, isValidUUID_1.isValidUUID)(expenseId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid expense id.'));
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        const body = {
            ...(0, utils_1.pick)(req.body, ['content']),
            expenseId: expenseId,
            authorId: req.auth.id,
            organizationId: orgId,
        };
        await db_1.db.transaction(async (tx) => {
            // make sure the expense belongs to the org
            const expense = await tx.query.expenses.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.expenses.id, expenseId), (0, drizzle_orm_1.eq)(db_1.expenses.organizationId, orgId))
            });
            if (!expense) {
                return res.status(400).json((0, response_1.createErrorResponse)('Expense not found.'));
            }
            const files = req.files;
            if ((!files || files.length <= 0) &&
                (!body.content || body.content.length === 0)) {
                return res.status(400).json((0, response_1.createErrorResponse)('Content cannot be empty if there are no attachments.'));
            }
            // Create the comment
            const [comment] = await tx.insert(db_1.comments).values(body).returning();
            if (!comment) {
                return res.status(400).json((0, response_1.createErrorResponse)('Failed to create comment.'));
            }
            let createdAttachments = null;
            // Check if there are any attachments
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
                        commentId: comment.id,
                    };
                });
                // Store the attachments metadata in the database
                createdAttachments = await tx.insert(db_1.attachments).values(attachmentsData).returning();
                if (!createdAttachments) {
                    return res.status(400).json((0, response_1.createErrorResponse)('Failed to create attachments.'));
                }
                // upload the attachments to s3Expense
                for (const file of files) {
                    await s3_1.default.upload(file, file.key);
                }
            }
            comment.Attachments = createdAttachments;
            return res.json((0, response_1.createSuccessResponse)(comment));
        });
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('An error occurred.', error));
    }
};
