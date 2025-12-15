"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Get organization clients
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID is required'));
        }
        const clientList = await db_1.db.query.clients.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.clients.organizationId, orgId)
        });
        res.status(200).json((0, response_1.createSuccessResponse)(clientList));
    }
    catch (error) {
        res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
