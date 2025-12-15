"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../../../../utils/response");
const db_1 = require("../../../../db");
const isValidUUID_1 = require("../../../../utils/isValidUUID");
const utils_1 = require("../../../../utils");
const drizzle_orm_1 = require("drizzle-orm");
// create invoice entry
exports.default = async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id;
        const orgId = req.params.org_id;
        if (!orgId || !(0, isValidUUID_1.isValidUUID)(orgId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invalid organization_id'));
        }
        if (!invoiceId || !(0, isValidUUID_1.isValidUUID)(invoiceId)) {
            return res.status(400).json((0, response_1.createErrorResponse)('Invoice ID is required'));
        }
        await db_1.db.transaction(async (tx) => {
            // make sure the invoice belongs to the org
            const invoice = await tx.query.invoices.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.invoices.id, invoiceId), (0, drizzle_orm_1.eq)(db_1.invoices.organizationId, orgId))
            });
            if (!invoice) {
                // throw new Error('Invoice not found') 
                // Return json response instead of throwing error catch
                return res.status(400).json((0, response_1.createErrorResponse)('Invoice not found'));
            }
            const [invoiceEntry] = await tx.insert(db_1.invoiceEntries)
                .values({
                ...(0, utils_1.pick)(req.body, [
                    'name',
                    'description',
                    'unitCost',
                    'quantity',
                ]),
                invoiceId: invoiceId,
            })
                .returning();
            res.status(200).json((0, response_1.createSuccessResponse)(invoiceEntry));
        });
    }
    catch (err) {
        return res.status(400).json((0, response_1.createErrorResponse)('', err));
    }
};
