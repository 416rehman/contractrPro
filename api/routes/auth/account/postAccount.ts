import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { db, users } from '../../../db';
import { pick } from '../../../utils';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const schema = z.object({
    body: z.object({
        username: z.string().min(1),
        password: z.string().min(6),
        email: z.string().email(),
        name: z.string().optional(),
        phoneCountry: z.string().optional(),
        phoneNumber: z.string().optional(),
        avatarUrl: z.string().optional(),
    }),
});

/**
 * @openapi
 * /auth/account:
 *   post:
 *     summary: Register a new user account
 *     description: |
 *       Creates a new user account with the provided details.
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
 *                 description: Unique username for the account.
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password for the account (min 6 chars).
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Valid email address for the user.
 *               name:
 *                 type: string
 *                 description: Full name of the user.
 *               phoneCountry:
 *                 type: string
 *                 description: ISO country code for phone number (e.g., "US").
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number.
 *               avatarUrl:
 *                 type: string
 *                 description: URL to user's avatar image.
 *             required: [username, password, email]
 *     responses:
 *       201:
 *         description: Account successfully created
 *       400:
 *         description: Validation error or User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many registration attempts
 */
const handler = async (req, res) => {
    const body = pick(req.body, [
        'username',
        'password',
        'email',
        'name',
        'phoneCountry',
        'phoneNumber',
        'avatarUrl',
    ])

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

export default { schema, handler };
