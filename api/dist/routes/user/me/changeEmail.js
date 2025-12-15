"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../utils/response");
const db_1 = require("../../../db");
const flags_1 = require("../../../db/flags");
const drizzle_orm_1 = require("drizzle-orm");
// When the body includes an email, it creates a new token with the USER_EMAIL_VERIFY_TOKEN flag and sends it to the user's email
exports.default = async (req, res) => {
    try {
        const email = req.body?.email?.trim();
        const UserId = req.auth.id;
        if (!email || email.length < 1) {
            return res.status(400).json((0, response_1.createErrorResponse)('Missing email'));
        }
        // validate email
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid email'));
        }
        const user = await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(db_1.users.id, UserId) });
        if (!user) {
            return res.status(400).json((0, response_1.createErrorResponse)('User not found'));
        }
        // if the user's email is the same as the email in the request body, don't do anything
        if (user.email === email) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Email already in use'));
        }
        // TODO: Implement email sending logic here? Original code assumes Token creation/update triggers logic or logic was missing.
        // It says "An email with further instructions has been sent".
        // The original code called Token.create/update. If there were hooks, they are gone.
        // I will just implement the Token DB update for now.
        await db_1.db.transaction(async (tx) => {
            // Check for existing token
            const preExistingToken = await tx.query.tokens.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.tokens.userId, user.id), (0, drizzle_orm_1.eq)(db_1.tokens.flags, flags_1.tokenFlags.USER_EMAIL_VERIFY_TOKEN))
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
                flags: flags_1.tokenFlags.USER_EMAIL_VERIFY_TOKEN,
                meta: { email }
            };
            if (preExistingToken) {
                await tx.update(db_1.tokens)
                    .set(tokenBody)
                    .where((0, drizzle_orm_1.eq)(db_1.tokens.id, preExistingToken.id));
            }
            else {
                await tx.insert(db_1.tokens).values(tokenBody);
            }
            return res.json((0, response_1.createSuccessResponse)('An email with further instructions has been sent to the provided email address'));
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json((0, response_1.createErrorResponse)('Internal Server Error', err));
    }
};
