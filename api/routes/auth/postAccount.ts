import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { db, users } from '../../db';
import { pick } from '../../utils';
import bcrypt from 'bcrypt';

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
        return res.status(400).json(createErrorResponse('Username is required'))
    }
    if (!body.password || body.password.length < 6) {
        return res
            .status(400)
            .json(createErrorResponse('Password must be at least 6 characters'))
    }
    if (!body.email) {
        return res.status(400).json(createErrorResponse('Email is required'))
    }

    try {
        const hashedPassword = await bcrypt.hash(body.password, 10);

        await db.transaction(async (tx) => {
            const [newUser] = await tx.insert(users).values({
                ...body,
                password: hashedPassword,
                // UpdatedByUserId: self (not in schema yet? assumed automatic or irrelevant)
            }).returning();

            if (newUser && newUser.password) {
                // manually remove password from response object if needed
                (newUser as any).password = undefined;
            }

            return res.status(201).json(createSuccessResponse(newUser))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
