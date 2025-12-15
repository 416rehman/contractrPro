import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import UUID from 'uuid';
import { pick } from '../../../utils';
import { db, comments, attachments } from '../../../db';
import { isValidUUID } from '../../../utils/isValidUUID';
import s3 from '../../../utils/s3';
import { eq, and, count, desc, InferSelectModel } from 'drizzle-orm';

type DBQuery = typeof db.query;
type CommentModel = InferSelectModel<typeof comments>;

interface FactoryConfig<K extends keyof DBQuery> {
    resourceTable: any;
    dbQueryKey: K;
    resourceIdParam: string;
    foreignKeyField: keyof CommentModel;
}

export const createCommentHandler = <K extends keyof DBQuery>({ resourceTable, dbQueryKey, resourceIdParam, foreignKeyField }: FactoryConfig<K>) => {
    return async (req: any, res: any) => {
        try {
            const resourceId = req.params[resourceIdParam];
            const orgId = req.params.org_id;

            if (!resourceId || !isValidUUID(resourceId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID));
            if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED));

            const body = {
                ...pick(req.body, ['content']),
                [foreignKeyField]: resourceId,
                authorId: req.auth.id,
                organizationId: orgId
            };

            await db.transaction(async (tx) => {
                // Check if resource exists in org
                const resource = await (tx.query as any)[dbQueryKey as string].findFirst({
                    where: and(eq(resourceTable.id, resourceId), eq(resourceTable.organizationId, orgId))
                });

                if (!resource) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

                const files = req.files;
                if ((!files || files.length <= 0) && (!body.content || body.content.length === 0)) {
                    return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED));
                }

                const [comment] = await tx.insert(comments).values(body).returning();
                if (!comment) return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR));

                let createdAttachments = null;
                if (files && files.length > 0) {
                    const attachmentsData = files.map((file: any) => {
                        file.key = UUID.v4();
                        const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`;
                        return {
                            id: file.key,
                            name: file.originalname,
                            type: file.mimetype,
                            size: file.size,
                            accessUrl,
                            commentId: comment.id
                        };
                    });
                    createdAttachments = await tx.insert(attachments).values(attachmentsData).returning();
                    for (const file of files) { await s3.upload(file, file.key); }
                }
                (comment as any).Attachments = createdAttachments;
                return res.json(createSuccessResponse(comment));
            });
        } catch (error) {
            return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error));
        }
    };
};

export const getCommentsHandler = <K extends keyof DBQuery>({ resourceTable, dbQueryKey, resourceIdParam, foreignKeyField }: FactoryConfig<K>) => {
    return async (req: any, res: any) => {
        try {
            const orgId = req.params.org_id;
            const resourceId = req.params[resourceIdParam];
            const { page = 1, limit = 10 } = req.query;
            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const offset = (pageNum - 1) * limitNum;

            // Simple existence check
            const resource = await (db.query as any)[dbQueryKey as string].findFirst({
                where: and(eq(resourceTable.id, resourceId), eq(resourceTable.organizationId, orgId))
            });
            if (!resource) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

            const fkColumn = (comments as any)[foreignKeyField];

            const commentsList = await db.query.comments.findMany({
                where: eq(fkColumn, resourceId),
                with: { attachments: true },
                limit: limitNum,
                offset: offset,
                orderBy: desc(comments.createdAt)
            });

            const totalCountResult = await db.select({ count: count() })
                .from(comments)
                .where(eq(fkColumn, resourceId));

            const totalCount = totalCountResult[0].count;
            const totalPages = Math.ceil(totalCount / limitNum);

            return res.status(200).json(createSuccessResponse({ comments: commentsList, currentPage: pageNum, totalPages }));
        } catch (err) {
            return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err));
        }
    };
};

export const updateCommentHandler = <K extends keyof DBQuery>({ resourceTable, dbQueryKey, resourceIdParam, foreignKeyField }: FactoryConfig<K>) => {
    return async (req: any, res: any) => {
        try {
            const resourceId = req.params[resourceIdParam];
            const orgId = req.params.org_id;
            const commentId = req.params.comment_id;

            if (!resourceId || !isValidUUID(resourceId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID));
            if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED));
            if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID));

            const body = { ...pick(req.body, ['content']) };

            await db.transaction(async (tx) => {
                const resource = await (tx.query as any)[dbQueryKey as string].findFirst({
                    where: and(eq(resourceTable.id, resourceId), eq(resourceTable.organizationId, orgId))
                });
                if (!resource) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

                const commentAttachments = await tx.query.attachments.findMany({ where: eq(attachments.commentId, commentId) });
                const currentAttachmentsCount = commentAttachments.length;
                const files = req.files;

                if ((!files || files.length <= 0) && (!body.content || body.content.length === 0)) {
                    if (currentAttachmentsCount === 0) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED));
                }

                // Verify comment belongs to resource and org
                const fkColumn = (comments as any)[foreignKeyField];

                const [comment] = await tx.update(comments)
                    .set(body)
                    .where(and(
                        eq(comments.id, commentId),
                        eq(comments.organizationId, orgId),
                        eq(fkColumn, resourceId)
                    ))
                    .returning();

                if (!comment) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

                if (files && files.length > 0) {
                    const attachmentsData = files.map((file: any) => {
                        file.key = UUID.v4();
                        const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`;
                        return {
                            id: file.key,
                            name: file.originalname,
                            type: file.mimetype,
                            size: file.size,
                            accessUrl,
                            commentId: commentId
                        };
                    });
                    await tx.insert(attachments).values(attachmentsData).returning();
                    for (const file of files) { await s3.upload(file, file.key); }
                }
                return res.json(createSuccessResponse(comment));
            });
        } catch (error) {
            return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error));
        }
    };
};

export const deleteCommentHandler = <K extends keyof DBQuery>({ resourceTable, dbQueryKey, resourceIdParam, foreignKeyField }: FactoryConfig<K>) => {
    return async (req: any, res: any) => {
        try {
            const commentId = req.params.comment_id;
            const resourceId = req.params[resourceIdParam];
            const orgId = req.params.org_id;

            if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID));
            if (!resourceId || !isValidUUID(resourceId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID));
            if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED));

            await db.transaction(async (tx) => {
                const resource = await (tx.query as any)[dbQueryKey as string].findFirst({
                    where: and(eq(resourceTable.id, resourceId), eq(resourceTable.organizationId, orgId))
                });
                if (!resource) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

                const fkColumn = (comments as any)[foreignKeyField];

                await tx.delete(comments).where(and(
                    eq(comments.id, commentId),
                    eq(fkColumn, resourceId),
                    eq(comments.organizationId, orgId)
                ));

                return res.status(200).json(createSuccessResponse(null));
            });
        } catch (err) {
            return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err));
        }
    };
};

export const deleteAttachmentHandler = <K extends keyof DBQuery>({ resourceTable, dbQueryKey, resourceIdParam, foreignKeyField }: FactoryConfig<K>) => {
    return async (req: any, res: any) => {
        try {
            const attachmentId = req.params.attachment_id;
            const commentId = req.params.comment_id;
            const resourceId = req.params[resourceIdParam];
            const orgId = req.params.org_id;

            if (!attachmentId || !isValidUUID(attachmentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID));
            if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID));
            if (!resourceId || !isValidUUID(resourceId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID));
            if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED));

            await db.transaction(async (tx) => {
                const resource = await (tx.query as any)[dbQueryKey as string].findFirst({
                    where: and(eq(resourceTable.id, resourceId), eq(resourceTable.organizationId, orgId))
                });
                if (!resource) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

                const deleted = await tx.delete(attachments)
                    .where(and(eq(attachments.id, attachmentId), eq(attachments.commentId, commentId)))
                    .returning();

                if (deleted.length > 0) {
                    const comment = await tx.query.comments.findFirst({
                        where: eq(comments.id, commentId),
                        with: { attachments: true }
                    });

                    if (comment && (!comment.content || comment.content.trim() === '') && comment.attachments.length === 0) {
                        await tx.delete(comments).where(eq(comments.id, commentId));
                    }
                }
                return res.json(createSuccessResponse(null));
            });
        } catch (error) {
            return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error));
        }
    };
};
