import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Terminate session
 *     description: |
 *       Logs out the user by clearing authentication cookies.
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         headers:
 *            Set-Cookie:
 *              schema:
 *                type: string
 *                example: accessToken=; Max-Age=0; Path=/; HttpOnly
 */
export default function logout(req, res) {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            path: '/'
        };

        res.clearCookie('accessToken', cookieOptions)
        res.clearCookie('refreshToken', cookieOptions)
        return res.status(200).json(createSuccessResponse(null))
    } catch (error) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

