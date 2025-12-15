"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
//Retrieve user by id
exports.default = async (req, res) => {
    try {
        const id = req.params.user_id;
        if (!id) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('user id is required'));
        }
        const resolvedId = id === 'me' || id === '@me' || id === '@' ? req.auth.id : id;
        //since user has unique id, it only return 1 user object
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.users.id, resolvedId),
            columns: {
                id: true,
                username: true,
                name: true,
                flags: true,
                createdAt: true,
                updatedAt: true,
                // avatarUrl: true, // TODO: Check if avatarUrl exists in schema
            }
        });
        if (!user) {
            return res.status(404).json((0, response_1.createErrorResponse)('User not found'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(user));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
