import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import UUID from 'uuid';
import { pick } from '../../../../utils';
import { db, vendors, comments, attachments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import s3 from '../../../../utils/s3';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const vendorId = req.params.vendor_id
        const orgId = req.params.org_id

        if (!vendorId || !isValidUUID(vendorId)) return res.status(400).json(createErrorResponse('Invalid vendor id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))

        const body = {
            ...pick(req.body, ['content']),
            vendorId: vendorId,
            authorId: req.auth.id,
            organizationId: orgId,
        }

        await db.transaction(async (tx) => {
            // make sure the vendor belongs to the org
            const vendor = await tx.query.vendors.findFirst({
                where: and(eq(vendors.id, vendorId), eq(vendors.organizationId, orgId))
            })
            if (!vendor) {
                return res.status(400).json(createErrorResponse('Vendor not found.'))
            }

            const files = (req as any).files;
            if (
                (!files || files.length <= 0) &&
                (!body.content || body.content.length === 0)
            ) {
                return res.status(400).json(createErrorResponse('Content cannot be empty if there are no attachments.'))
            }

            // Create the comment
            const [comment] = await tx.insert(comments).values(body).returning();
            if (!comment) {
                return res.status(400).json(createErrorResponse('Failed to create comment.'))
            }

            let createdAttachments = null
            // Check if there are any attachments
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
                        commentId: comment.id,
                    }
                })

                // Store the attachments metadata in the database
                createdAttachments = await tx.insert(attachments).values(attachmentsData).returning();
                if (!createdAttachments) {
                    return res.status(400).json(createErrorResponse('Failed to create attachments.'))
                }

                // upload the attachments to s3Vendor
                for (const file of files) {
                    await s3.upload(file, file.key)
                }
            }

            (comment as any).Attachments = createdAttachments

            return res.json(createSuccessResponse(comment))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('An error occurred.', error))
    }
}
