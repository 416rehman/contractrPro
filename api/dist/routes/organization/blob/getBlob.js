"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const response_1 = require("../../../utils/response");
const db_1 = require("../../../db");
const s3_1 = __importDefault(require("../../../utils/s3"));
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Gets a blob - can provide a ?download=true query param to download the blob
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const blobId = req.params.blob_id;
        const { download } = req.query;
        if (!(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org id.'));
        if (!(0, isValidUUID_1.isValidUUID)(blobId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid blob id.'));
        // make sure the attachment belongs to the org
        const [attachment] = await db_1.db.select({
            id: db_1.attachments.id,
            name: db_1.attachments.name,
            type: db_1.attachments.type,
            size: db_1.attachments.size,
            accessUrl: db_1.attachments.accessUrl
        })
            .from(db_1.attachments)
            .innerJoin(db_1.comments, (0, drizzle_orm_1.eq)(db_1.attachments.commentId, db_1.comments.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.attachments.id, blobId), (0, drizzle_orm_1.eq)(db_1.comments.organizationId, orgId)))
            .limit(1);
        if (!attachment) {
            return res.status(400).json((0, response_1.createErrorResponse)('Blob not found.'));
        }
        const actualFileName = attachment.name;
        const data = await s3_1.default.get(blobId);
        if (!data) {
            return res.status(400).json((0, response_1.createErrorResponse)('Failed to get blob.'));
        }
        console.log({ actualFileName });
        res.writeHead(200, {
            'Content-Type': attachment.type,
            'Content-Length': data.ContentLength,
            'Content-Disposition': download
                ? `attachment; filename=${actualFileName}`
                : `inline; filename=${actualFileName}`,
        });
        if (data.Body instanceof stream_1.Readable) {
            data.Body.pipe(res);
        }
        else {
            res.end(data.Body);
        }
    }
    catch (error) {
        res.status(500).json((0, response_1.createErrorResponse)('Failed to get blob.'));
    }
};
