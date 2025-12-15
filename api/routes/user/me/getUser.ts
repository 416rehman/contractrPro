import { db, users } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { eq } from 'drizzle-orm';

//Retrieve user by id

export default async (req, res) => {
    try {
        //since user has unique id, it only return 1 user object
        const user = await db.query.users.findFirst({
            where: eq(users.id, req.auth.id),
            columns: {
                id: true,
                username: true,
                email: true,
                name: true,
                flags: true,
                createdAt: true,
                updatedAt: true,
                // phoneCountry: true, // TODO: verify schema
                // phoneNumber: true,
                // avatarUrl: true,
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
