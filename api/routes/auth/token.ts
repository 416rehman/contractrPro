import { signJWT } from '../../utils';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, users } from '../../db';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /auth/token:
 *   post:
 *     summary: Exchange refresh token for access token
 *     description: |
 *       Regenerates an access token using a valid refresh token.
 *       The refresh token can be provided via cookie (preferred) or request body.
 *       
 *       **Rate Limit**: 30 requests per 15 minutes.
 *       
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         headers: 
 *           Set-Cookie:
 *             schema: 
 *               type: string
 *               example: accessToken=...; Path=/; HttpOnly; Secure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: The refreshed access token.
 *       400:
 *         description: Invalid or missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export default async (req, res) => {
    try {
        // Prefer cookie, then body, then query
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.query?.refreshToken;

        if (!refreshToken || refreshToken.length < 1) {
            return res
                .status(400)
                .json(createErrorResponse(ErrorCode.AUTH_MISSING_REFRESH_TOKEN))
        }

        const user = await db.query.users.findFirst({
            where: eq(users.refreshToken, refreshToken)
        });

        if (!user)
            return res.status(400).json(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND))

        const token = await signJWT(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                flags: user.flags,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            process.env.JWT_SECRET
        )

        return res
            .status(200)
            .cookie('accessToken', token, {
                httpOnly: true,
                sameSite: 'none',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24 * 7,
            })
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24 * 7,
            })
            .json(createSuccessResponse({ token }))
    } catch (error) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

