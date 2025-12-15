import { db, users } from '../../db';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { inArray } from 'drizzle-orm';

/**
 * @openapi
 * /admin/users:
 *   patch:
 *     summary: Bulk update user fields (admin only)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               column:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Users updated
 *       400:
 *         description: Validation error
 */
export default async (req, res) => {
    const { userIds, column, value } = req.body

    if (!userIds || userIds.length < 1) {
        return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
    }

    if (!column || column.length < 1) {
        return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
    }

    if (!value || value.length < 1) {
        return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
    }

    try {
        await db.transaction(async (tx) => {
            await tx.update(users)
                .set({ [column]: value })
                .where(inArray(users.id, userIds));
        })
        return res.json(createSuccessResponse(null))
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

