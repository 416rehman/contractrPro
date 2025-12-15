"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    const { userIds, column, value } = req.body;
    if (!userIds || userIds.length < 1) {
        return res
            .status(400)
            .json((0, response_1.createErrorResponse)('Missing user IDs. It should be an array of user IDs.'));
    }
    if (!column || column.length < 1) {
        return res.status(400).json((0, response_1.createErrorResponse)('Missing column name.'));
    }
    if (!value || value.length < 1) {
        return res.status(400).json((0, response_1.createErrorResponse)('Missing value.'));
    }
    try {
        await db_1.db.transaction(async (tx) => {
            // Update the user's column with the new value where the user ID is in the array of user IDs
            // Potentially unsafe if column is not validated, but matching legacy behavior.
            // TS might complain about dynamic key.
            await tx.update(db_1.users)
                .set({
                [column]: value
            })
                .where((0, drizzle_orm_1.inArray)(db_1.users.id, userIds));
        });
        return res.json((0, response_1.createSuccessResponse)('Users updated successfully'));
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
