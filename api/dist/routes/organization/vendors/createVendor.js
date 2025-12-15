"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const utils_1 = require("../../../utils");
const isValidUUID_1 = require("../../../utils/isValidUUID");
// Creates an organization's vendor
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
                'phone',
                'email',
                'website',
                'description',
            ]),
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        };
        const [vendor] = await db_1.db.insert(db_1.vendors).values(body).returning();
        res.status(201).json((0, response_1.createSuccessResponse)(vendor));
    }
    catch (error) {
        res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
