"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const utils_1 = require("../../../utils");
const isValidUUID_1 = require("../../../utils/isValidUUID");
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
                'permissions',
                'UserId',
            ]),
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        };
        // Map 'UserId' from request body to 'userId' for schema
        if (body.UserId) {
            body.userId = body.UserId;
            delete body.UserId;
        }
        const [member] = await db_1.db.insert(db_1.organizationMembers).values(body).returning();
        res.status(201).json((0, response_1.createSuccessResponse)(member));
    }
    catch (error) {
        res.status(400).json((0, response_1.createErrorResponse)('', error));
    }
};
