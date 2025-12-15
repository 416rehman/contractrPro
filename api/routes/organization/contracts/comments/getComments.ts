import { db, contracts, comments, attachments } from '../../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../../utils/response';
import { eq, and, count, desc } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        const { page = 1, limit = 10 } = req.query
        const optsLimit = parseInt(limit as string);
        const optsOffset = (parseInt(page as string) - 1) * optsLimit;

        // Verify contract
        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
        });
        if (!contract) {
            return res.status(400).json(createErrorResponse('Contract not found.'))
        }

        // Get comments with pagination and count
        // Drizzle doesn't have `findAndCountAll`.
        // We do two queries.

        const whereClause = eq(comments.contractId, contractId);

        const totalResult = await db.select({ count: count() }).from(comments).where(whereClause);
        const total = totalResult[0].count;

        const results = await db.query.comments.findMany({
            where: whereClause,
            limit: optsLimit,
            offset: optsOffset,
            with: {
                attachments: true
            },
            orderBy: [desc(comments.createdAt)] // Legacy default usually created_at desc? Or asc?
            // Legacy didn't specify order, so default usage.
        });

        const totalPages = Math.ceil(total / optsLimit)
        const response = {
            comments: results,
            currentPage: parseInt(page as string),
            totalPages,
        }

        return res.status(200).json(createSuccessResponse(response))
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', err))
    }
}
