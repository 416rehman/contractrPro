"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
// get invoice
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const invoiceId = req.params.invoice_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid organization_id'));
        if (!invoiceId || !(0, isValidUUID_1.isValidUUID)(invoiceId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid invoice_id'));
        const invoice = await db_1.db.query.invoices.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.invoices.id, invoiceId), (0, drizzle_orm_1.eq)(db_1.invoices.organizationId, orgId)),
            with: {
                invoiceEntries: true // Always include? Legacy had `include: { model: InvoiceEntry }` always.
            }
        });
        if (!invoice) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invoice not found'));
        }
        return res.status(200).json((0, response_1.createSuccessResponse)(invoice));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
