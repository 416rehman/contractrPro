import { db, users } from '../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { count } from 'drizzle-orm';

// Retrieves all users with pagination
export default async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const limitNum = parseInt(limit);
        const offsetNum = (parseInt(page) - 1) * limitNum;

        const userList = await db.query.users.findMany({
            limit: limitNum,
            offset: offsetNum,
            columns: {
                id: true,
                username: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                // avatarUrl: true, // TODO: verify in schema
            }
        });

        const [totalCount] = await db.select({ count: count() }).from(users);

        const totalPages = Math.ceil(totalCount.count / limitNum)
        const response = {
            users: userList,
            currentPage: parseInt(page),
            totalPages,
        }

        return res.status(200).json(createSuccessResponse(response))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
