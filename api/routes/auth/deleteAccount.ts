import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';

import { db, users } from '../../db';
import { eq } from 'drizzle-orm';

export default async (req, res) => {
    try {
        await db.transaction(async (tx) => {
            const deleted = await tx.delete(users)
                .where(eq(users.id, req.auth.id))
                .returning();

            if (deleted.length === 0) {
                return res.status(400).json(createErrorResponse('User not found'))
            }

            return res.json(createSuccessResponse({}))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
