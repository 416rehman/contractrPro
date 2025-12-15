import { db, users } from '../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { inArray } from 'drizzle-orm';

export default async (req, res) => {
    const { userIds, column, value } = req.body

    if (!userIds || userIds.length < 1) {
        return res
            .status(400)
            .json(
                createErrorResponse(
                    'Missing user IDs. It should be an array of user IDs.'
                )
            )
    }

    if (!column || column.length < 1) {
        return res.status(400).json(createErrorResponse('Missing column name.'))
    }

    if (!value || value.length < 1) {
        return res.status(400).json(createErrorResponse('Missing value.'))
    }

    try {
        await db.transaction(async (tx) => {
            // Update the user's column with the new value where the user ID is in the array of user IDs
            // Potentially unsafe if column is not validated, but matching legacy behavior.
            // TS might complain about dynamic key.
            await tx.update(users)
                .set({
                    [column]: value
                })
                .where(inArray(users.id, userIds));
        })
        return res.json(createSuccessResponse('Users updated successfully'))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
