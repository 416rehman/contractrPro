"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const isValidUUID_1 = require("../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Gets a user's organization
exports.default = async (req, res) => {
    try {
        const userID = req.params.user_id;
        if (!userID || !(0, isValidUUID_1.isValidUUID)(userID)) {
            return res.status(400).json((0, response_1.createErrorResponse)('User ID required'));
        }
        // Transaction is not necessary for a single read query
        const userOrganizations = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.users.id, userID),
            columns: {
                password: false,
                refreshToken: false,
                // deletedAt: false,
                // UpdatedByUserId: false,
            },
            with: {
                organizationMemberships: {
                    with: {
                        organization: true,
                    }
                }
            }
        });
        if (!userOrganizations) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('User not found'));
        }
        return res
            .status(200)
            .json((0, response_1.createSuccessResponse)(userOrganizations));
    }
    catch (error) {
        res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
