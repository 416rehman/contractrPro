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
 *         description: Access token returned and set as cookie
 *       400:
 *         description: Invalid refresh token
 */
export default async (req, res) => {
    try {
        const refreshToken = req.query.refreshToken || req.body.refreshToken
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
                httpOnly: false,
                sameSite: 'none',
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 * 7,
            })
            .cookie('refreshToken', refreshToken, {
                httpOnly: false,
                sameSite: 'none',
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 * 7,
            })
            .json(createSuccessResponse({ token }))
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

