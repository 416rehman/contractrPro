"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../db");
const response_1 = require("../../utils/response");
const drizzle_orm_1 = require("drizzle-orm");
const isValidUUID_1 = require("../../utils/isValidUUID");
exports.default = async (req, res) => {
    try {
        const userID = req.params.user_id;
        const organizationID = req.params.org_id;
        if (!userID || !(0, isValidUUID_1.isValidUUID)(userID))
            return res.status(400).json((0, response_1.createErrorResponse)('User ID is required'));
        if (!organizationID || !(0, isValidUUID_1.isValidUUID)(organizationID))
            return res.status(400).json((0, response_1.createErrorResponse)('Organization ID is required'));
        await db_1.db.transaction(async (tx) => {
            const user = await tx.query.users.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.users.id, userID)
            });
            if (!user) {
                return res.status(404).json((0, response_1.createErrorResponse)('User not found'));
            }
            const organization = await tx.query.organizations.findFirst({
                where: (0, drizzle_orm_1.eq)(db_1.organizations.id, organizationID)
            });
            if (!organization) {
                return res.status(404).json((0, response_1.createErrorResponse)('Organization not found'));
            }
            // remove organization member
            await tx.delete(db_1.organizationMembers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.userId, userID), (0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, organizationID)));
            return res.status(200).json((0, response_1.createSuccessResponse)('Leave organization successfully'));
        });
    }
    catch (error) {
        return res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
