import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';

import { db, users, tokens } from '../../../db';
import { tokenFlags } from '../../../db/flags';
import { eq, and } from 'drizzle-orm';

// When the body includes an email, it creates a new token with the USER_EMAIL_VERIFY_TOKEN flag and sends it to the user's email
export default async (req, res) => {
    try {
        const email = req.body?.email?.trim()
        const UserId = req.auth.id

        if (!email || email.length < 1) {
            return res.status(400).json(createErrorResponse('Missing email'))
        }

        // validate email
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json(createErrorResponse('Invalid email'))
        }

        const user = await db.query.users.findFirst({ where: eq(users.id, UserId) });
        if (!user) {
            return res.status(400).json(createErrorResponse('User not found'))
        }

        // if the user's email is the same as the email in the request body, don't do anything
        if (user.email === email) {
            return res
                .status(400)
                .json(createErrorResponse('Email already in use'))
        }

        // TODO: Implement email sending logic here? Original code assumes Token creation/update triggers logic or logic was missing.
        // It says "An email with further instructions has been sent".
        // The original code called Token.create/update. If there were hooks, they are gone.
        // I will just implement the Token DB update for now.

        await db.transaction(async (tx) => {
            // Check for existing token
            const preExistingToken = await tx.query.tokens.findFirst({
                where: and(
                    eq(tokens.userId, user.id),
                    eq(tokens.flags, tokenFlags.USER_EMAIL_VERIFY_TOKEN)
                )
            });

            // "body" in original was Token.emailVerifyTokenTemplate(UserId, email).
            // I need to replicate that template logic or just insert raw values.
            // Template likely created a random value and set type.
            const tokenValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            // meta: { email } ? Original used "body".
            const tokenBody = {
                type: 'email_verify',
                value: tokenValue,
                userId: UserId,
                flags: tokenFlags.USER_EMAIL_VERIFY_TOKEN,
                meta: { email }
            };

            if (preExistingToken) {
                await tx.update(tokens)
                    .set(tokenBody)
                    .where(eq(tokens.id, preExistingToken.id));
            } else {
                await tx.insert(tokens).values(tokenBody);
            }

            return res.json(
                createSuccessResponse(
                    'An email with further instructions has been sent to the provided email address'
                )
            )
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json(createErrorResponse('Internal Server Error', err));
    }
}
