"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../utils/response");
const db_1 = require("../../../db");
const flags_1 = require("../../../db/flags");
const drizzle_orm_1 = require("drizzle-orm");
// When the body includes a phone, it creates a new token with the USER_PHONE_VERIFY_TOKEN flag and sends it to the user's phone
exports.default = async (req, res) => {
    try {
        const phoneCountry = req.body?.phoneCountry?.trim();
        const phoneNumber = req.body?.phoneNumber?.trim();
        const UserId = req.auth.id;
        if (!phoneCountry || phoneCountry.length < 1) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Missing phoneCountry'));
        }
        if (!phoneNumber || phoneNumber.length < 1) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Missing phoneNumber'));
        }
        // Make sure the phoneCountry is digits only and not more than 5 digits
        if (!/^\d+$/.test(phoneCountry) || phoneCountry.length > 5) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invalid phoneCountry'));
        }
        // Make sure the phoneNumber is digits only and not more than 20 digits
        if (!/^\d+$/.test(phoneNumber) || phoneNumber.length > 20) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invalid phoneNumber'));
        }
        const user = await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(db_1.users.id, UserId) });
        if (!user) {
            return res.status(400).json((0, response_1.createErrorResponse)('User not found'));
        }
        // if the user's phone is the same as the phone in the request body, don't do anything
        if (user.phoneCountry === phoneCountry &&
            user.phoneNumber === phoneNumber) {
            return res
                .status(200)
                .json((0, response_1.createErrorResponse)('Phone already in use'));
        }
        await db_1.db.transaction(async (tx) => {
            // const body = Token.phoneVerifyTokenTemplate(UserId, phoneCountry, phoneNumber)
            const tokenValue = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code for phones usually
            const tokenBody = {
                type: 'phone_verify',
                value: tokenValue,
                userId: UserId,
                flags: flags_1.tokenFlags.USER_PHONE_VERIFY_TOKEN,
                meta: { phoneCountry, phoneNumber }
            };
            const preExistingToken = await tx.query.tokens.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.tokens.userId, user.id), (0, drizzle_orm_1.eq)(db_1.tokens.flags, flags_1.tokenFlags.USER_PHONE_VERIFY_TOKEN))
            });
            if (preExistingToken) {
                await tx.update(db_1.tokens).set(tokenBody).where((0, drizzle_orm_1.eq)(db_1.tokens.id, preExistingToken.id));
            }
            else {
                await tx.insert(db_1.tokens).values(tokenBody);
            }
            return res.json((0, response_1.createSuccessResponse)('A text message with further instructions has been sent to the provided phone number'));
        });
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
