import { signJWT } from '../../utils';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../utils/response';
import { db, users } from '../../db';
import { eq } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const refreshToken = req.query.refreshToken || req.body.refreshToken
        if (!refreshToken || refreshToken.length < 1) {
            return res
                .status(400)
                .json(createErrorResponse('Missing refresh token'))
        }

        const user = await db.query.users.findFirst({
            where: eq(users.refreshToken, refreshToken)
        });

        if (!user)
            return res.status(400).json(createErrorResponse('User not found'))

        const token = await signJWT(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                flags: user.flags,
                // avatarUrl: user.avatarUrl, // schema check needed
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
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            })
            .cookie('refreshToken', refreshToken, {
                httpOnly: false,
                sameSite: 'none',
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            })
            .json(createSuccessResponse({ token }))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
