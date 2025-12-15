"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../utils/response");
const db_1 = require("../../db");
const flags_1 = require("../../db/flags");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
// Creates a new token with the USER_PASSWORD_RESET_TOKEN flag and sends it to the user's email
exports.default = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || email.length < 1) {
            return res.status(400).json((0, response_1.createErrorResponse)('Missing email'));
        }
        await db_1.db.transaction(async (tx) => {
            const user = await tx.query.users.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.users.email, email),
                columns: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    avatarUrl: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (user) {
                // if the user already has a token, update it
                const token = await tx.query.tokens.findFirst({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.tokens.userId, user.id), (0, drizzle_orm_1.eq)(db_1.tokens.flags, flags_1.tokenFlags.USER_PASSWORD_RESET_TOKEN))
                });
                const tokenBody = {
                    userId: user.id,
                    type: 'password_reset',
                    value: (0, crypto_1.randomUUID)(),
                    flags: flags_1.tokenFlags.USER_PASSWORD_RESET_TOKEN
                };
                // Send email TODO
                console.log(tokenBody);
                if (token) {
                    await tx.update(db_1.tokens)
                        .set(tokenBody)
                        .where((0, drizzle_orm_1.eq)(db_1.tokens.id, token.id));
                }
                else {
                    await tx.insert(db_1.tokens).values(tokenBody);
                }
            }
            // Ambiguous response to prevent email enumeration
            return res.json((0, response_1.createSuccessResponse)('If the email exists, a password reset token has been sent to it.'));
        });
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
