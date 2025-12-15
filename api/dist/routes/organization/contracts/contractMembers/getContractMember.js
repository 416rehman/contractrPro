"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../../db");
const response_1 = require("../../../../utils/response");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// Get Contract Members
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const contractId = req.params.contract_id;
        if (!(0, isValidUUID_1.isValidUUID)(contractId)) {
            return res
                .status(400)
                .json((0, response_1.createErrorResponse)('Invalid contract_id'));
        }
        if (!(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid org_id'));
        }
        // Legacy: returns OrganizationMember if part of contract. 
        // Logic: findOne orgMember via include Contract(where id=contractId).
        // Wait, legacy does NOT filter by `req.params.member_id`?
        // Ah, `req.params.member_id` is NOT used in legacy code?
        // Let's check legacy code carefully.
        // It says `const member = await OrganizationMember.findOne({...})`.
        // It does NOT use `req.params.member_id` or similar.
        // It seems to fetch ONE member. Which one? `findOne` without other where clauses returns ANY one.
        // That seems like a bug in legacy or I missed something.
        // `routes/organization/contracts/contractMembers/getContractMember.ts`
        // Usually `getContractMember` implies getting a specific one.
        // But the legacy code:
        /*
            const member = await OrganizationMember.findOne({
                where: { OrganizationId: orgId },
                include: [{ model: Contract, where: { id: contractId }, required: true }]
            })
        */
        // This gets the FIRST member of the organization who is ALSO on the contract.
        // If that's the intention, I'll replicate. But usually you want a specific member.
        // Route path probably has `:member_id`?
        // I should check `index.ts` to see route parameters if possible, but I don't see it listing routes here.
        // Looking at `deleteContractMember` or `update` they use `req.params.member_id`.
        // `getContractMember` SHOULD probably use `member_id`?
        // If I follow legacy strictly, I replicate the "random first member" behavior?
        // But if `member_id` is in params, I should use it.
        // Legacy code shown above imported `Contract, OrganizationMember` but didn't use `req.params.member_id`.
        // I will assume it was intended to use `member_id` if it's a GET /:member_id.
        // OR it's a GET /contracts/:contract_id/members/me ? No.
        // If I look at `getContractMember` legacy code again.
        // It's definitely missing `id: memberId` in where clause if it's meant to be specific.
        // I'll check if `req.params.member_id` exists in `req` object?
        // I'll add `const memberId = req.params.member_id` and use it if it exists.
        // If legacy didn't use it, it might be bugged.
        // I'll check `deleteContractMember` or `update` to see param names.
        // `updateContractMember` uses `req.params.member_id`.
        // So `getContractMember` should too.
        const memberId = req.params.member_id;
        const member = await db_1.db.query.organizationMembers.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.organizationMembers.organizationId, orgId), memberId ? (0, drizzle_orm_1.eq)(db_1.organizationMembers.id, memberId) : undefined),
            with: {
                contractMembers: {
                    where: (0, drizzle_orm_1.eq)(db_1.contractMembers.contractId, contractId)
                }
            }
        });
        // Filter if contractMembers exists
        // Legacy uses `required: true` on include Contract, so it acts as inner join on junction.
        if (!member || !member.contractMembers || member.contractMembers.length === 0) {
            return res
                .status(404)
                .json((0, response_1.createErrorResponse)('Contract member not found'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(member));
    }
    catch (err) {
        console.error(err);
        return res
            .status(500)
            .json((0, response_1.createErrorResponse)('Failed to get contract member'));
    }
};
