import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import UUID from 'uuid';
import { pick } from '../../../../utils';
import { db, contracts, comments, attachments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import s3 from '../../../../utils/s3';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        const body = {
            ...pick(req.body, ['content']),
            contractId: contractId,
            authorId: req.auth.id,
            updatedByUserId: req.auth.id,
            organizationId: orgId,
        }

        // Validate contract
        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
        });
        if (!contract) {
            return res.status(400).json(createErrorResponse('Contract not found.'))
        }

        const files = (req as any).files;
        if (
            (!files || files.length <= 0) &&
            (!body.content || body.content.length === 0)
        ) {
            return res
                .status(400)
                .json(
                    createErrorResponse(
                        'Content cannot be empty if there are no attachments.'
                    )
                )
        }

        // Create comment
        // Transaction? Legacy used transaction for S3 metadata storage.
        // We can wrap in db.transaction if needed. 
        // Although S3 upload is outside DB transaction usually, but here metadata is inside.

        await db.transaction(async (tx) => {
            const [comment] = await tx.insert(comments).values(body).returning();

            if (!comment) {
                throw new Error('Failed to create comment.');
            }

            let savedAttachments = null;
            if (files && files.length > 0) {
                const attachmentsData = files.map((file: any) => {
                    file.key = UUID.v4();
                    const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`
                    return {
                        id: file.key, // Should be UUID? file.key is UUID from UUID.v4()
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size,
                        accessUrl,
                        commentId: comment.id,
                    }
                });

                savedAttachments = await tx.insert(attachments).values(attachmentsData).returning();

                // Upload to S3
                for (const file of files) {
                    await s3.upload(file, file.key)
                }
            }

            // Return comment with attachments
            // Legacy structured `comment.dataValues.Attachments = attachments`.
            // We return plain object.
            const response = {
                ...comment,
                attachments: savedAttachments
            };

            return res.json(createSuccessResponse(response));
        });

    } catch (error) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', error))
    }
}
