import { db, users } from '../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { eq } from 'drizzle-orm';

//Retrieve user by id

export default async (req, res) => {
    try {
        const id = req.params.user_id

        if (!id) {
            return res
                .status(400)
                .json(createErrorResponse('user id is required'))
        }

        const resolvedId = id === 'me' || id === '@me' || id === '@' ? req.auth.id : id;

        //since user has unique id, it only return 1 user object
        const user = await db.query.users.findFirst({
            where: eq(users.id, resolvedId),
            columns: {
                id: true,
                username: true,
                name: true,
                flags: true,
                createdAt: true,
                updatedAt: true,
                // avatarUrl: true, // TODO: Check if avatarUrl exists in schema
            }
        });

        if (!user) {
            return res.status(404).json(createErrorResponse('User not found'))
        }

        return res.status(200).json(createSuccessResponse(user))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
