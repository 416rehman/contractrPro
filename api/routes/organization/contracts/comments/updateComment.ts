import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import UUID from 'uuid';
import { pick } from '../../../../utils';
import { db, contracts, comments, attachments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import s3 from '../../../../utils/s3';
import { eq, and, count } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const commentId = req.params.comment_id

        if (!contractId || !isValidUUID(contractId)) res.status(400).json(createErrorResponse('Invalid contract id.'))
        if (!orgId || !isValidUUID(orgId)) res.status(400).json(createErrorResponse('Invalid org id.'))
        if (!commentId || !isValidUUID(commentId)) res.status(400).json(createErrorResponse('Invalid comment id.'))

        const body = {
            ...pick(req.body, ['content']),
            updatedByUserId: req.auth.id,
        }

        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
        });
        if (!contract) return res.status(400).json(createErrorResponse('Contract not found.'))

        await db.transaction(async (tx) => {
            // Check current attachments
            const currentAttachmentsResult = await tx.select({ count: count() }).from(attachments).where(eq(attachments.commentId, commentId));
            const currentAttachments = currentAttachmentsResult[0].count;

            const files = (req as any).files;
            if (
                (!files || files.length > 0) &&
                (!body.content || body.content.length === 0)
            ) {
                if (currentAttachments === 0) {
                    // Need to error
                    throw new Error('Content cannot be empty if there are no attachments.');
                }
            }

            // Update comment
            const [updated] = await tx.update(comments)
                .set(body)
                .where(and(
                    eq(comments.id, commentId),
                    eq(comments.organizationId, orgId),
                    eq(comments.contractId, contractId)
                ))
                .returning();

            if (!updated) {
                throw new Error('Failed to update comment.');
            }

            let savedAttachments = null;
            if (files && files.length > 0) {
                const attachmentsData = files.map((file: any) => {
                    file.key = UUID.v4();
                    const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`
                    return {
                        id: file.key,
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size,
                        accessUrl,
                        commentId: commentId,
                    }
                });

                savedAttachments = await tx.insert(attachments).values(attachmentsData).returning();

                for (const file of files) {
                    await s3.upload(file, file.key)
                }
            }

            // To return full object including attachments?
            // Legacy returned `comment` object. It didn't explicitly reload attachments, but logic suggests client might want them.
            // `returnValue` logic in legacy didn't attach `attachments` in update unless newly created.
            // I'll return updated comment. 
            // If client needs attachments, they might need to fetch again or I can include new ones.
            // Legacy: `return res.json(createSuccessResponse(comment))`

            return res.json(createSuccessResponse(updated));
        });

    } catch (error) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', error))
    }
}
