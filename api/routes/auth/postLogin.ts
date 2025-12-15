import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { db, users } from '../../db';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { pick } from '../../utils';

/**
 * @api {post} /auth/login Gets the user's refresh token
 * @apiName Login
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
            return res.status(400).json(createErrorResponse('User not found'))

        const isValidPass = await bcrypt.compareSync(
            body.password,
            user.password
        )
        if (!isValidPass) {
            return res.status(400).json(createErrorResponse('Invalid password'))
        }

        return res.json(
            createSuccessResponse({
                refreshToken: user.refreshToken,
                message:
                    'Use this refresh token at the /auth/token endpoint to get an access token and set the cookie.',
            })
        )
    } catch (error) {
        console.error(error);
        return res.status(400).json(createErrorResponse('', error))
    }
}
