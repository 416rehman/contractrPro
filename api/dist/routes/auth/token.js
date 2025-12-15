"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const response_1 = require("../../utils/response");
const db_1 = require("../../db");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const refreshToken = req.query.refreshToken || req.body.refreshToken;
        if (!refreshToken || refreshToken.length < 1) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Missing refresh token'));
        }
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.users.refreshToken, refreshToken)
        });
        if (!user)
            return res.status(400).json((0, response_1.createErrorResponse)('User not found'));
        const token = await (0, utils_1.signJWT)({
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            flags: user.flags,
            // avatarUrl: user.avatarUrl, // schema check needed
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }, process.env.JWT_SECRET);
        return res
            .status(200)
            .cookie('accessToken', token, {
            httpOnly: false,
            sameSite: 'none',
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })
            .cookie('refreshToken', refreshToken, {
            httpOnly: false,
            sameSite: 'none',
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        })
            .json((0, response_1.createSuccessResponse)({ token }));
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
