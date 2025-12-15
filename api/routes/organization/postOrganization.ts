import { db, organizations, addresses, organizationMembers } from '../../db';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { pick } from '../../utils';

/**
 * @openapi
 * /organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     responses:
 *       201:
 *         description: Organization created
 *       400:
 *         description: Validation error
 */
export default async (req, res) => {
    try {
        const body = {
            ...pick(req.body, ['name', 'description', 'email', 'phone', 'website', 'logoUrl']),
            ownerId: req.auth.id,
        }

        await db.transaction(async (tx) => {
            const [org] = await tx.insert(organizations).values(body).returning();

            if (req.body.Address) {
                await tx.insert(addresses).values({
                    ...req.body.Address,
                    organizationId: org.id
                });
                (org as any).Address = req.body.Address;
            }

            await tx.insert(organizationMembers).values({
                organizationId: org.id,
                userId: req.auth.id,
                role: 'owner',
            });

            return res.status(201).json(createSuccessResponse(org))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

