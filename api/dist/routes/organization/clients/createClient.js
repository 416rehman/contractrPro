"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const utils_1 = require("../../../utils");
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Organization ID is required'));
        }
        const body = {
            ...(0, utils_1.pick)(req.body, [
                'name',
                'email',
                'phone',
                'website',
                'description',
            ]),
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        };
        const [client] = await db_1.db.insert(db_1.clients).values(body).returning();
        return res.status(201).json((0, response_1.createSuccessResponse)(client));
    }
    catch (error) {
        res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
