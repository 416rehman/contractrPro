import { db, clients, comments } from '../../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../../utils/response';
import { eq, and, count, desc } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const clientId = req.params.client_id

        const { page = 1, limit = 10 } = req.query

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;

        // make sure the client belongs to the org
        const client = await db.query.clients.findFirst({
            where: and(eq(clients.id, clientId), eq(clients.organizationId, orgId))
        })
        if (!client) {
            return res.status(400).json(createErrorResponse('Client not found.'))
        }

        // Get the comments
        const commentsList = await db.query.comments.findMany({
            where: eq(comments.clientId, clientId),
            with: {
                attachments: true
            },
            limit: limitNum,
            offset: offset,
            orderBy: desc(comments.createdAt)
        })

        const totalCountResult = await db.select({ count: count() })
            .from(comments)
            .where(eq(comments.clientId, clientId));

        const totalCount = totalCountResult[0].count;
        const totalPages = Math.ceil(totalCount / limitNum)
        const response = {
            comments: commentsList,
            currentPage: pageNum,
            totalPages,
        }

        return res.status(200).json(createSuccessResponse(response))

    } catch (err) {
        return res.status(400).json(createErrorResponse('An error occurred.', err))
    }
}
