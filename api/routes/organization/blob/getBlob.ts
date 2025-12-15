import { Readable } from 'stream';
import { createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { db, attachments, comments } from '../../../db';
import s3 from '../../../utils/s3';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/blob/{blob_id}:
 *   get:
 *     summary: Get a blob file from S3
 *     tags: [Blobs]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: blob_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: download
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: File content
 *       400:
 *         description: Invalid ID or blob not found
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const blobId = req.params.blob_id
        const { download } = req.query

        if (!isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!isValidUUID(blobId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

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
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        const actualFileName = attachment.name

        const data = await s3.get(blobId)
        if (!data) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

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
        res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

