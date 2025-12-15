import { createSuccessResponse, createErrorResponse } from '../utils/response';
import { db, tokens, users } from '../db';
import { tokenFlags, UserFlags } from '../db/flags';
import { isFlagSet } from '../utils/flags';
import { eq } from 'drizzle-orm';

// 2 types of tokens:

// some tokens will use the data associated with the token and update a value in the database.
// i.e the USER_EMAIL_VERIFY_TOKEN will update the user's email to the one associated with the token

// other tokens will require data at the time of verification, such as the password reset token
// i.e the USER_PASSWORD_RESET_TOKEN will require a new password to be sent in the body.data field of the request

export default async (req, res) => {
    try {
        const { token } = req.query;
        const data = req.body.data;

        if (!token || typeof token !== 'string' || token.length < 1) {
            return res.status(400).json(createErrorResponse('Missing token'));
        }

        const tokenInstance = await db.query.tokens.findFirst({
            where: eq(tokens.value, token)
        });

        if (!tokenInstance) {
            return res.status(400).json(createErrorResponse('Invalid token'));
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, tokenInstance.userId!)
        });

        if (!user) {
            return res.status(400).json(createErrorResponse('Invalid token'));
        }

        // Get the token flags
        const type = tokenInstance.flags || 0;

        if (isFlagSet(type, tokenFlags.USER_EMAIL_VERIFY_TOKEN)) {
            await db.transaction(async (tx) => {
                // Update user with new email and add verified flag
                await tx.update(users)
                    .set({
                        email: tokenInstance.meta as string,
                        flags: (user.flags || 0) | UserFlags.VERIFIED_EMAIL
                    })
                    .where(eq(users.id, user.id));

                // Delete the token
                await tx.delete(tokens).where(eq(tokens.id, tokenInstance.id));
            });

            return res.send(
                createSuccessResponse(`Email verified and set to ${tokenInstance.meta}`)
            );
        } else if (isFlagSet(type, tokenFlags.USER_PHONE_VERIFY_TOKEN)) {
            await db.transaction(async (tx) => {
                const phoneData = tokenInstance.meta as any;
                if (!phoneData || !phoneData.phoneCountry || !phoneData.phoneNumber) {
                    return res.status(400).json(
                        createErrorResponse(
                            'This token requires a phone number in the format { phoneCountry: "1", phoneNumber: "1234567890" }'
                        )
                    );
                }

                await tx.update(users)
                    .set({
                        phoneCountry: phoneData.phoneCountry,
                        phoneNumber: phoneData.phoneNumber,
                        flags: (user.flags || 0) | UserFlags.VERIFIED_PHONE
                    })
                    .where(eq(users.id, user.id));

                await tx.delete(tokens).where(eq(tokens.id, tokenInstance.id));
            });

            return res.send(createSuccessResponse('Phone verified and updated'));
        } else if (isFlagSet(type, tokenFlags.USER_PASSWORD_RESET_TOKEN)) {
            await db.transaction(async (tx) => {
                if (!data || data.length < 1) {
                    return res.status(400).json(
                        createErrorResponse(
                            'This token requires a new password to be passed in the { data: "new password" } body'
                        )
                    );
                }

                await tx.update(users)
                    .set({ password: data })
                    .where(eq(users.id, user.id));

                await tx.delete(tokens).where(eq(tokens.id, tokenInstance.id));

                return res.send(createSuccessResponse('Password reset successfully'));
            });
        } else {
            // Ambiguous error message to prevent token guessing
            return res.status(400).json(createErrorResponse('This token is invalid or expired'));
        }
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error));
    }
};
