"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../utils/response");
const db_1 = require("../../db");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        await db_1.db.transaction(async (tx) => {
            const deleted = await tx.delete(db_1.users)
                .where((0, drizzle_orm_1.eq)(db_1.users.id, req.auth.id))
                .returning();
            if (deleted.length === 0) {
                return res.status(400).json((0, response_1.createErrorResponse)('User not found'));
            }
            return res.json((0, response_1.createSuccessResponse)({}));
        });
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
