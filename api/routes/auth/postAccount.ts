import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, users } from '../../db';
import { pick } from '../../utils';
import bcrypt from 'bcrypt';

/**
 * @openapi
 * /auth/account:
 *   post:
 *     summary: Register a new user account
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
 *               password:
 *                 type: string
 *                 minLength: 6
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               phoneCountry:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *             required: [username, password, email]
 *     responses:
 *       201:
 *         description: Account created
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export default async (req, res) => {
    const body = pick(req.body, [
        'username',
        'password',
        'email',
        'name',
        'phoneCountry',
        'phoneNumber',
        'avatarUrl',
    ])

    if (!body.username) {
        return res.status(400).json(createErrorResponse(ErrorCode.AUTH_USERNAME_REQUIRED))
    }
    if (!body.password || body.password.length < 6) {
        return res.status(400).json(createErrorResponse(ErrorCode.AUTH_PASSWORD_TOO_SHORT))
    }
    if (!body.email) {
        return res.status(400).json(createErrorResponse(ErrorCode.AUTH_EMAIL_REQUIRED))
    }

    try {
        const hashedPassword = await bcrypt.hash(body.password, 10);

        await db.transaction(async (tx) => {
            const [newUser] = await tx.insert(users).values({
                ...body,
                password: hashedPassword,
            }).returning();

            if (newUser && newUser.password) {
                (newUser as any).password = undefined;
            }

            return res.status(201).json(createSuccessResponse(newUser))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

