import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';

import { db, users } from '../../../db';
import { eq } from 'drizzle-orm';

// Update the user's name
export default async (req, res) => {
    try {
        const name = req.body?.name?.trim()
        const UserId = req.auth.id

        if (!name || name.length < 1) {
            return res.status(400).json(createErrorResponse('Missing name'))
        }

        const [updatedUser] = await db.update(users)
            .set({ name })
            .where(eq(users.id, UserId))
            .returning();

        return res.json(createSuccessResponse(updatedUser))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
