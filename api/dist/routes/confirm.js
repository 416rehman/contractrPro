"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../utils/response");
const db_1 = require("../db");
const flags_1 = require("../db/flags");
const flags_2 = require("../utils/flags");
const drizzle_orm_1 = require("drizzle-orm");
// 2 types of tokens:
// some tokens will use the data associated with the token and update a value in the database.
// i.e the USER_EMAIL_VERIFY_TOKEN will update the user's email to the one associated with the token
// other tokens will require data at the time of verification, such as the password reset token
// i.e the USER_PASSWORD_RESET_TOKEN will require a new password to be sent in the body.data field of the request
exports.default = async (req, res) => {
    try {
        const { token } = req.query;
        const data = req.body.data;
        if (!token || typeof token !== 'string' || token.length < 1) {
            return res.status(400).json((0, response_1.createErrorResponse)('Missing token'));
        }
        const tokenInstance = await db_1.db.query.tokens.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.tokens.value, token)
        });
        if (!tokenInstance) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid token'));
        }
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.users.id, tokenInstance.userId)
        });
        if (!user) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid token'));
        }
        // Get the token flags
        const type = tokenInstance.flags || 0;
        if ((0, flags_2.isFlagSet)(type, flags_1.tokenFlags.USER_EMAIL_VERIFY_TOKEN)) {
            await db_1.db.transaction(async (tx) => {
                // Update user with new email and add verified flag
                await tx.update(db_1.users)
                    .set({
                    email: tokenInstance.meta,
                    flags: (user.flags || 0) | flags_1.UserFlags.VERIFIED_EMAIL
                })
                    .where((0, drizzle_orm_1.eq)(db_1.users.id, user.id));
                // Delete the token
                await tx.delete(db_1.tokens).where((0, drizzle_orm_1.eq)(db_1.tokens.id, tokenInstance.id));
            });
            return res.send((0, response_1.createSuccessResponse)(`Email verified and set to ${tokenInstance.meta}`));
        }
        else if ((0, flags_2.isFlagSet)(type, flags_1.tokenFlags.USER_PHONE_VERIFY_TOKEN)) {
            await db_1.db.transaction(async (tx) => {
                const phoneData = tokenInstance.meta;
                if (!phoneData || !phoneData.phoneCountry || !phoneData.phoneNumber) {
                    return res.status(400).json((0, response_1.createErrorResponse)('This token requires a phone number in the format { phoneCountry: "1", phoneNumber: "1234567890" }'));
                }
                await tx.update(db_1.users)
                    .set({
                    phoneCountry: phoneData.phoneCountry,
                    phoneNumber: phoneData.phoneNumber,
                    flags: (user.flags || 0) | flags_1.UserFlags.VERIFIED_PHONE
                })
                    .where((0, drizzle_orm_1.eq)(db_1.users.id, user.id));
                await tx.delete(db_1.tokens).where((0, drizzle_orm_1.eq)(db_1.tokens.id, tokenInstance.id));
            });
            return res.send((0, response_1.createSuccessResponse)('Phone verified and updated'));
        }
        else if ((0, flags_2.isFlagSet)(type, flags_1.tokenFlags.USER_PASSWORD_RESET_TOKEN)) {
            await db_1.db.transaction(async (tx) => {
                if (!data || data.length < 1) {
                    return res.status(400).json((0, response_1.createErrorResponse)('This token requires a new password to be passed in the { data: "new password" } body'));
                }
                await tx.update(db_1.users)
                    .set({ password: data })
                    .where((0, drizzle_orm_1.eq)(db_1.users.id, user.id));
                await tx.delete(db_1.tokens).where((0, drizzle_orm_1.eq)(db_1.tokens.id, tokenInstance.id));
                return res.send((0, response_1.createSuccessResponse)('Password reset successfully'));
            });
        }
        else {
            // Ambiguous error message to prevent token guessing
            return res.status(400).json((0, response_1.createErrorResponse)('This token is invalid or expired'));
        }
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
