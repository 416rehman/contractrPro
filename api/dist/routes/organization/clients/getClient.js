"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Get organization client
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const clientId = req.params.client_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID is required'));
        }
        if (!clientId || !(0, isValidUUID_1.isValidUUID)(clientId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Client ID is required'));
        }
        const client = await db_1.db.query.clients.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.clients.organizationId, orgId), (0, drizzle_orm_1.eq)(db_1.clients.id, clientId))
        });
        if (!client) {
            return res.status(400).json((0, response_1.createErrorResponse)('Client not found'));
        }
        res.status(200).json((0, response_1.createSuccessResponse)(client));
    }
    catch (error) {
        res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
