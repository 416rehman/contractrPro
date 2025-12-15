import { db, users } from '../../db';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { count } from 'drizzle-orm';

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
export default async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;

        const usersList = await db.query.users.findMany({
            columns: {
                id: true,
                username: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                phoneCountry: true,
                phoneNumber: true,
                avatarUrl: true
            },
            limit: limitNum,
            offset: offset
        })

        const totalCountResult = await db.select({ count: count() }).from(users);
        const totalCount = totalCountResult[0].count;

        const totalPages = Math.ceil(totalCount / limitNum)
        const response = {
            users: usersList,
            currentPage: pageNum,
            totalPages,
        }

        return res.status(200).json(createSuccessResponse(response))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

