import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';

import { db, users, tokens } from '../../../db';
import { tokenFlags } from '../../../db/flags';
import { eq, and } from 'drizzle-orm';

// When the body includes a phone, it creates a new token with the USER_PHONE_VERIFY_TOKEN flag and sends it to the user's phone
export default async (req, res) => {
    try {
        const phoneCountry = req.body?.phoneCountry?.trim()
        const phoneNumber = req.body?.phoneNumber?.trim()

        const UserId = req.auth.id

        if (!phoneCountry || phoneCountry.length < 1) {
            return res
                .status(400)
                .json(createErrorResponse('Missing phoneCountry'))
        }

        if (!phoneNumber || phoneNumber.length < 1) {
            return res
                .status(400)
                .json(createErrorResponse('Missing phoneNumber'))
        }

        // Make sure the phoneCountry is digits only and not more than 5 digits
        if (!/^\d+$/.test(phoneCountry) || phoneCountry.length > 5) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid phoneCountry'))
        }

        // Make sure the phoneNumber is digits only and not more than 20 digits
        if (!/^\d+$/.test(phoneNumber) || phoneNumber.length > 20) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid phoneNumber'))
        }

        const user = await db.query.users.findFirst({ where: eq(users.id, UserId) });
        if (!user) {
            return res.status(400).json(createErrorResponse('User not found'))
        }

        // if the user's phone is the same as the phone in the request body, don't do anything
        if (
            user.phoneCountry === phoneCountry &&
            user.phoneNumber === phoneNumber
        ) {
            return res
                .status(200)
                .json(createErrorResponse('Phone already in use'))
        }

        await db.transaction(async (tx) => {
            // const body = Token.phoneVerifyTokenTemplate(UserId, phoneCountry, phoneNumber)
            const tokenValue = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code for phones usually
            const tokenBody = {
                type: 'phone_verify',
                value: tokenValue,
                userId: UserId,
                flags: tokenFlags.USER_PHONE_VERIFY_TOKEN,
                meta: { phoneCountry, phoneNumber }
            };

            const preExistingToken = await tx.query.tokens.findFirst({
                where: and(
                    eq(tokens.userId, user.id),
                    eq(tokens.flags, tokenFlags.USER_PHONE_VERIFY_TOKEN),
                )
            })

            if (preExistingToken) {
                await tx.update(tokens).set(tokenBody).where(eq(tokens.id, preExistingToken.id));
            } else {
                await tx.insert(tokens).values(tokenBody);
            }

            return res.json(
                createSuccessResponse(
                    'A text message with further instructions has been sent to the provided phone number'
                )
            )
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
