import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, users } from '../../db';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { pick } from '../../utils';

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login and get refresh token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required: [password]
 *     responses:
 *       200:
 *         description: Returns refresh token
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export default async (req, res) => {
    try {
        const body = pick(req.body, ['username', 'email', 'password'])

        const user = await db.query.users.findFirst({
            where: or(
                body.username ? eq(users.username, body.username) : undefined,
                body.email ? eq(users.email, body.email) : undefined
            )
        })
        if (!user)
            return res.status(400).json(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND))

        const isValidPass = await bcrypt.compareSync(
            body.password,
            user.password
        )
        if (!isValidPass) {
            return res.status(400).json(createErrorResponse(ErrorCode.AUTH_INVALID_PASSWORD))
        }

        return res.json(
            createSuccessResponse({
                refreshToken: user.refreshToken,
            })
        )
    } catch (error) {
        console.error(error);
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

