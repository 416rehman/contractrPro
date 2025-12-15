import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';

import { db, users, tokens } from '../../db';
import { tokenFlags } from '../../db/flags';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Creates a new token with the USER_PASSWORD_RESET_TOKEN flag and sends it to the user's email
export default async (req, res) => {
    try {
        const { email } = req.body
        if (!email || email.length < 1) {
            return res.status(400).json(createErrorResponse('Missing email'))
        }

        await db.transaction(async (tx) => {
            const user = await tx.query.users.findFirst({
                where: eq(users.email, email),
                columns: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    avatarUrl: true,
                    createdAt: true,
                    updatedAt: true
                }
            })

            if (user) {
                // if the user already has a token, update it
                const token = await tx.query.tokens.findFirst({
                    where: and(
                        eq(tokens.userId, user.id),
                        eq(tokens.flags, tokenFlags.USER_PASSWORD_RESET_TOKEN)
                    )
                })

                const tokenBody = {
                    userId: user.id,
                    type: 'password_reset',
                    value: randomUUID(),
                    flags: tokenFlags.USER_PASSWORD_RESET_TOKEN
                }
                // Send email TODO
                console.log(tokenBody)

                if (token) {
                    await tx.update(tokens)
                        .set(tokenBody)
                        .where(eq(tokens.id, token.id));
                } else {
                    await tx.insert(tokens).values(tokenBody);
                }
            }

            // Ambiguous response to prevent email enumeration
            return res.json(
                createSuccessResponse(
                    'If the email exists, a password reset token has been sent to it.'
                )
            )
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
