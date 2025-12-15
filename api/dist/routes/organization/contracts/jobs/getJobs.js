"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Get jobs
exports.default = async (req, res) => {
    try {
        const orgID = req.params.org_id;
        const contractID = req.params.contract_id;
        if (!orgID || !(0, isValidUUID_1.isValidUUID)(orgID)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Organization ID required'));
        }
        if (!contractID || !(0, isValidUUID_1.isValidUUID)(contractID)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Contract ID required'));
        }
        const jobList = await db_1.db.query.jobs.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.jobs.contractId, contractID), (0, drizzle_orm_1.eq)(db_1.jobs.organizationId, orgID)),
            with: {
                contract: true
            }
        });
        // Legacy code checked `if (!jobs) return 400 "Contract not found"`.
        // But findAll returns empty array if not found, not null/undefined?
        // Actually Promise<Model[]> always resolves to array.
        // Legacy check was `if (!jobs)`.
        // But if contract doesn't exist, search for jobs returns [] or fails?
        // If contract doesn't exist, we probably return empty array or 404?
        // Legacy code: returned "Contract not found" if jobs is falsy? 
        // `findAll` usually returns `[]`. `[]` is truthy.
        // So legacy code block `if (!jobs)` was probably unreachable unless DB error?
        // Wait, legacy also had `include Contract with required: true`. 
        // If contract didn't match, the inner join would return 0 rows.
        // But `jobs` array would be `[]`, not null.
        // So `!jobs` is false.
        // Maybe legacy meant `jobs.length === 0`? No, standard findAll is [].
        // I will return empty array if empty, unless I want to explicitly check contract existence first.
        // I will trust returning [] is fine. Or verify contract first?
        // I'll stick to returning found jobs.
        return res.status(200).json((0, response_1.createSuccessResponse)(jobList));
    }
    catch (error) {
        res.status(500).json((0, response_1.createErrorResponse)('Failed to get jobs.', error));
    }
};
