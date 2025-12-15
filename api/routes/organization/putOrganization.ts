import { db, organizations } from '../../db';
import { createErrorResponse, createSuccessResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { pick } from '../../utils';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}:
 *   put:
 *     summary: Update an organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization updated
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Organization not found
 */
export default async (req, res) => {
    try {
        const body = {
            ...pick(req.body, ['name', 'description', 'email', 'phone', 'website', 'logoUrl']),
        }

        const orgId = req.params.org_id
        if (!orgId) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const [updatedOrg] = await db.update(organizations)
            .set(body)
            .where(eq(organizations.id, orgId))
            .returning();

        if (!updatedOrg) {
            return res.status(404).json(createErrorResponse(ErrorCode.ORG_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(updatedOrg))
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

