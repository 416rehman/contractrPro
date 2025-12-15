"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../utils/response");
const db_1 = require("../../../db");
const drizzle_orm_1 = require("drizzle-orm");
// Update the user's name
exports.default = async (req, res) => {
    try {
        const name = req.body?.name?.trim();
        const UserId = req.auth.id;
        if (!name || name.length < 1) {
            return res.status(400).json((0, response_1.createErrorResponse)('Missing name'));
        }
        const [updatedUser] = await db_1.db.update(db_1.users)
            .set({ name })
            .where((0, drizzle_orm_1.eq)(db_1.users.id, UserId))
            .returning();
        return res.json((0, response_1.createSuccessResponse)(updatedUser));
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
