"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// DELETE /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id
const db_1 = require("../../../db");
const response_1 = require("../../../utils/response");
const isValidUUID_1 = require("../../../utils/isValidUUID");
const drizzle_orm_1 = require("drizzle-orm");
exports.default = async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const invoiceId = req.params.invoice_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId))
            return res.status(400).json((0, response_1.createErrorResponse)('Organization ID is required'));
        if (!invoiceId || !(0, isValidUUID_1.isValidUUID)(invoiceId))
            return res.status(400).json((0, response_1.createErrorResponse)('Invoice ID is required'));
        const deletedRows = await db_1.db.delete(db_1.invoices)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.invoices.id, invoiceId), (0, drizzle_orm_1.eq)(db_1.invoices.organizationId, orgId)))
            .returning();
        if (!deletedRows.length) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invoice not found'));
        }
        res.status(200).json((0, response_1.createSuccessResponse)(deletedRows.length));
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
