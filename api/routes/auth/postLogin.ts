import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, users } from '../../db';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { pick } from '../../utils';
import { z } from 'zod';

const schema = z.object({
    body: z.object({
        username: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().min(1, "Password is required"),
    }).refine((data) => data.username || data.email, {
        message: "Either username or email is required",
        path: ["username"],
    }),
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user and retrieve access tokens
 *     description: |
 *       Authenticates a user using either username or email and password.
 *       
 *       **Rate Limit**: 5 requests per 15 minutes.
 *       
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
 *                 description: User's unique username. Required if email is not provided.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address. Required if username is not provided.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's raw password.
 *             required: [password]
 *             example:
 *               email: "john@example.com"
 *               password: "securePassword123"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         headers: 
 *           Set-Cookie:
 *             schema: 
 *               type: string
 *               example: refreshToken=abcde12345; Path=/; HttpOnly; Secure; SameSite=None
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
 *                     refreshToken:
 *                       type: string
 *                       description: The refresh token (also set in cookie).
 *       400:
 *         description: Authentication failed (Invalid credentials or missing user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Validation error (Missing fields or invalid format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const handler = async (req, res) => {
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

        return res
            .cookie('refreshToken', user.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })
            .json(
                createSuccessResponse({
                    refreshToken: user.refreshToken,
                })
            )
    } catch (error) {
        console.error(error);
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

export default { schema, handler };
