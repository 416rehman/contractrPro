import { Readable } from 'stream';
import { createErrorResponse } from '../../../utils/response';
import { db, attachments, comments } from '../../../db';
import s3 from '../../../utils/s3';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Gets a blob - can provide a ?download=true query param to download the blob
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const blobId = req.params.blob_id
        const { download } = req.query

        if (!isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))
        if (!isValidUUID(blobId)) return res.status(400).json(createErrorResponse('Invalid blob id.'))

        // make sure the attachment belongs to the org
        const [attachment] = await db.select({
            id: attachments.id,
            name: attachments.name,
            type: attachments.type,
            size: attachments.size,
            accessUrl: attachments.accessUrl
        })
            .from(attachments)
            .innerJoin(comments, eq(attachments.commentId, comments.id))
            .where(
                and(
                    eq(attachments.id, blobId),
                    eq(comments.organizationId, orgId)
                )
            )
            .limit(1);

        if (!attachment) {
            return res.status(400).json(createErrorResponse('Blob not found.'))
        }

        const actualFileName = attachment.name

        const data = await s3.get(blobId)
        if (!data) {
            return res.status(400).json(createErrorResponse('Failed to get blob.'))
        }

        console.log({ actualFileName })

        res.writeHead(200, {
            'Content-Type': attachment.type,
            'Content-Length': data.ContentLength,
            'Content-Disposition': download
                ? `attachment; filename=${actualFileName}`
                : `inline; filename=${actualFileName}`,
        })
        if (data.Body instanceof Readable) {
            data.Body.pipe(res)
        } else {
            res.end(data.Body);
        }
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to get blob.'))
    }
}
