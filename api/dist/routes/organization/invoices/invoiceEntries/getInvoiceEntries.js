"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../../utils/response");
const db_1 = require("../../../../db");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// get invoice entries
exports.default = async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id;
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid organization_id'));
        if (!invoiceId || !(0, isValidUUID_1.isValidUUID)(invoiceId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invoice ID is required'));
        // make sure the invoice belongs to the org
        const invoice = await db_1.db.query.invoices.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.invoices.id, invoiceId), (0, drizzle_orm_1.eq)(db_1.invoices.organizationId, orgId))
        });
        if (!invoice) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invoice not found'));
        }
        const entries = await db_1.db.query.invoiceEntries.findMany({
            where: (0, drizzle_orm_1.eq)(db_1.invoiceEntries.invoiceId, invoiceId)
        });
        res.status(200).json((0, response_1.createSuccessResponse)(entries));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
