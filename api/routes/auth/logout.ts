import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout and clear cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
export default function logout(req, res) {
    try {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        return res.status(200).json(createSuccessResponse(null))
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

