import { db, organizationMembers, users, organizations } from '../../db';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { eq, and } from 'drizzle-orm';
import { isValidUUID } from '../../utils/isValidUUID';

export default async (req, res) => {
    try {
        const userID = req.params.user_id
        const organizationID = req.params.org_id

        if (!userID || !isValidUUID(userID)) return res.status(400).json(createErrorResponse('User ID is required'))
        if (!organizationID || !isValidUUID(organizationID)) return res.status(400).json(createErrorResponse('Organization ID is required'))

        await db.transaction(async (tx) => {
            const user = await tx.query.users.findFirst({
                where: eq(users.id, userID)
            });
            if (!user) {
                return res.status(404).json(createErrorResponse('User not found'))
            }

            const organization = await tx.query.organizations.findFirst({
                where: eq(organizations.id, organizationID)
            });
            if (!organization) {
                return res.status(404).json(createErrorResponse('Organization not found'))
            }

            // remove organization member
            await tx.delete(organizationMembers)
                .where(and(
                    eq(organizationMembers.userId, userID),
                    eq(organizationMembers.organizationId, organizationID)
                ));

            return res.status(200).json(createSuccessResponse('Leave organization successfully'))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
