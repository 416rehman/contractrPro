import { db, invoices, invoiceEntries, contracts, jobs } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils/index';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/invoices:
 *   post:
 *     summary: Create an invoice
 *     tags: [Invoices]
 *     responses:
 *       201:
 *         description: Invoice created
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        const entriesData = req.body?.InvoiceEntries?.map((entry: any) =>
            pick(entry, ['description', 'quantity', 'unitCost', 'name'])
        ) || []

        if (entriesData.length === 0) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        const body = {
            ...pick(req.body, ['invoiceNumber', 'issueDate', 'dueDate', 'poNumber', 'note', 'taxRate']),
            billToClientId: req.body.BillToClientId,
            contractId: req.body.ContractId,
            jobId: req.body.JobId,
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        }

        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

        await db.transaction(async (tx) => {
            if (body.contractId) {
                const contract = await tx.query.contracts.findFirst({
                    where: and(eq(contracts.id, body.contractId), eq(contracts.organizationId, orgId))
                });
                if (!contract) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));
            }

            if (body.jobId) {
                const job = await tx.query.jobs.findFirst({
                    where: and(eq(jobs.id, body.jobId), eq(jobs.organizationId, orgId))
                });
                if (!job) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));
            }

            const [invoice] = await tx.insert(invoices).values(body).returning();
            if (!invoice) return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR));

            const entriesWithId = entriesData.map((entry: any) => ({
                ...entry,
                invoiceId: invoice.id,
                updatedByUserId: req.auth.id
            }));

            await tx.insert(invoiceEntries).values(entriesWithId);

            const response = { ...invoice, invoiceEntries: entriesWithId };
            return res.status(201).json(createSuccessResponse(response))
        })
    } catch (e: any) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}
