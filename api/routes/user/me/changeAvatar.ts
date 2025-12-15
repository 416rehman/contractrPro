import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';

import { db, users } from '../../../db';
import { eq } from 'drizzle-orm';

// Update the user's avatarUrl
export default async (req, res) => {
    try {
        const avatarUrl = req.body?.avatarUrl?.trim()
        const UserId = req.auth.id

        if (!avatarUrl || avatarUrl.length < 1) {
            return res
                .status(400)
                .json(createErrorResponse('Missing avatarUrl'))
        }

        // no blobs / base64 strings allowed
        if (avatarUrl.startsWith('data:')) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid avatarUrl'))
        }

        const [updatedUser] = await db.update(users)
            .set({ avatarUrl })
            .where(eq(users.id, UserId))
            .returning();

        return res.json(createSuccessResponse(updatedUser))

    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
