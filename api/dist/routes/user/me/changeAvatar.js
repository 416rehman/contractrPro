"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../utils/response");
const db_1 = require("../../../db");
const drizzle_orm_1 = require("drizzle-orm");
// Update the user's avatarUrl
exports.default = async (req, res) => {
    try {
        const avatarUrl = req.body?.avatarUrl?.trim();
        const UserId = req.auth.id;
        if (!avatarUrl || avatarUrl.length < 1) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Missing avatarUrl'));
        }
        // no blobs / base64 strings allowed
        if (avatarUrl.startsWith('data:')) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invalid avatarUrl'));
        }
        const [updatedUser] = await db_1.db.update(db_1.users)
            .set({ avatarUrl })
            .where((0, drizzle_orm_1.eq)(db_1.users.id, UserId))
            .returning();
        return res.json((0, response_1.createSuccessResponse)(updatedUser));
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
