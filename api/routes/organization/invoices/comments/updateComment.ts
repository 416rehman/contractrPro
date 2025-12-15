import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import UUID from 'uuid';
import { pick } from '../../../../utils';
import { db, invoices, comments, attachments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import s3 from '../../../../utils/s3';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id
        const orgId = req.params.org_id
        const commentId = req.params.comment_id

        if (!invoiceId || !isValidUUID(invoiceId)) return res.status(400).json(createErrorResponse('Invalid invoice id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))
        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse('Invalid comment id.'))

        const body = {
            ...pick(req.body, ['content']),
            // UpdatedByUserId: req.auth.id, // Not in schema for comments?
        }

        await db.transaction(async (tx) => {
            // make sure the invoice belongs to the org
            const invoice = await tx.query.invoices.findFirst({
                where: and(eq(invoices.id, invoiceId), eq(invoices.organizationId, orgId))
            })
            if (!invoice) {
                return res.status(400).json(createErrorResponse('Invoice not found.'))
            }

            // check if the comment currently has attachments
            const commentAttachments = await tx.query.attachments.findMany({
                where: eq(attachments.commentId, commentId)
            });
            const currentAttachmentsCount = commentAttachments.length;

            const files = (req as any).files;
            if (
                (!files || files.length <= 0) &&
                (!body.content || body.content.length === 0)
            ) {
                if (currentAttachmentsCount === 0) {
                    return res.status(400).json(createErrorResponse('Content cannot be empty if there are no attachments.'))
                }
            }

            // Update the comment
            const [comment] = await tx.update(comments)
                .set(body)
                .where(and(
                    eq(comments.id, commentId),
                    eq(comments.organizationId, orgId),
                    eq(comments.invoiceId, invoiceId)
                ))
                .returning();

            if (!comment) {
                return res.status(400).json(createErrorResponse('Failed to update comment.'))
            }

            let createdAttachments = null
            // Check if there are any new attachments
            if (files && files.length > 0) {
                // Process attachments
                const attachmentsData = files.map((file: any) => {
                    file.key = UUID.v4();

                    // https://[bucket-name].s3.[region-code].amazonaws.com/[key-name]
                    const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`

                    return {
                        id: file.key,
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size,
                        accessUrl,
                        commentId: commentId,
                    }
                })

                // Store the attachments metadata in the database
                createdAttachments = await tx.insert(attachments).values(attachmentsData).returning();
                if (!createdAttachments) {
                    return res.status(400).json(createErrorResponse('Failed to create attachments.'))
                }

                // upload the attachments to s3Invoice
                for (const file of files) {
                    await s3.upload(file, file.key)
                }
            }

            return res.json(createSuccessResponse(comment))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('An error occurred.', error))
    }
}
