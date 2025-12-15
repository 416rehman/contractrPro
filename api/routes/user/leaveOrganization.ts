import { db, organizationMembers, users, organizations } from '../../db';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { eq, and } from 'drizzle-orm';
import { isValidUUID } from '../../utils/isValidUUID';

/**
 * @openapi
 * /users/{user_id}/organizations/{org_id}/leave:
 *   post:
 *     summary: Leave an organization
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Left organization
 */
export default async (req, res) => {
    try {
        const userID = req.params.user_id
        const organizationID = req.params.org_id

        if (!userID || !isValidUUID(userID)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_USER_ID_REQUIRED))
        if (!organizationID || !isValidUUID(organizationID)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))

        await db.transaction(async (tx) => {
            const user = await tx.query.users.findFirst({
                where: eq(users.id, userID)
            });
            if (!user) {
                return res.status(404).json(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND))
            }

            const organization = await tx.query.organizations.findFirst({
                where: eq(organizations.id, organizationID)
            });
            if (!organization) {
                return res.status(404).json(createErrorResponse(ErrorCode.ORG_NOT_FOUND))
            }

            await tx.delete(organizationMembers)
                .where(and(
                    eq(organizationMembers.userId, userID),
                    eq(organizationMembers.organizationId, organizationID)
                ));

            return res.status(200).json(createSuccessResponse(null))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

