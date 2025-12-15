import { createSuccessResponse } from '../../utils/response';
import { getRolePermissions } from '../../utils/permissions';
import { OrgRole } from '../../db/enums';

/**
 * @openapi
 * /organizations/{org_id}/roles:
 *   get:
 *     summary: Get available roles and their permissions
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of roles with permissions bitmask
 */
export default async (req, res) => {
    const roles = Object.values(OrgRole).map((role) => ({
        role: role,
        permissions: getRolePermissions(role).toString()
    }));

    return res.json(createSuccessResponse(roles));
};
