"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const utils_1 = require("../../../utils");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Deletes an organization's invite
exports.default = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const inviteID = req.params.invite_id;
        if (!orgID || !(0, isValidUUID_1.isValidUUID)(orgID)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID required'));
        }
        if (!inviteID || !(0, utils_1.isValidInviteCode)(inviteID)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invite ID required'));
        }
        const deletedRows = await db_1.db.delete(db_1.invites)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.invites.id, inviteID), (0, drizzle_orm_1.eq)(db_1.invites.organizationId, orgID)))
            .returning();
        // if delete returns array of deleted rows
        if (!deletedRows.length) {
            // Maybe it wasn't found
            // Standard behavior for delete is just success, but legacy code checked return value.
            // Returning success explicitly.
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(deletedRows.length));
    }
    catch (err) {
        return res
            .status(500)
            .json((0, response_1.createErrorResponse)('Error deleting invite', err));
    }
};
