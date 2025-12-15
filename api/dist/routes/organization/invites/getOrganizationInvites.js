"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Gets the organization's invite
exports.default = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        if (!orgID || !(0, isValidUUID_1.isValidUUID)(orgID)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID required'));
        }
        const inviteList = await db_1.db.query.invites.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.invites.organizationId, orgID)
        });
        if (!inviteList || inviteList.length === 0) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization not found'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(inviteList));
    }
    catch (err) {
        return res
            .status(500)
            .json((0, response_1.createErrorResponse)('Error getting organization invites', err.message));
    }
};
