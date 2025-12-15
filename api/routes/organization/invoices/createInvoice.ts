import {
    db,
    invoices,
    invoiceEntries,
    contracts,
    jobs
} from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils/index';
import { eq, and } from 'drizzle-orm';

// create invoice
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid organization_id'))
        }

        const entriesData =
            req.body?.InvoiceEntries?.map((entry: any) =>
                pick(entry, ['description', 'quantity', 'unitCost', 'name'])
            ) || []

        if (entriesData.length === 0) {
            return res.status(400).json(createErrorResponse(
                'InvoiceEntries is required. Provide at least one entry.'
            ))
        }

        const body = {
            ...pick(req.body, [
                'invoiceNumber',
                'issueDate',
                'dueDate',
                'poNumber',
                'note',
                'taxRate',
                // 'BillToClientId', // CamelCase in schema?
            ]),
            billToClientId: req.body.BillToClientId,
            contractId: req.body.ContractId,
            jobId: req.body.JobId,
            organizationId: orgId,
            updatedByUserId: req.auth.id,
        }

        // Clean undefined params
        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

        await db.transaction(async (tx) => {
            // Verify contract if provided
            if (body.contractId) {
                const contract = await tx.query.contracts.findFirst({
                    where: and(eq(contracts.id, body.contractId), eq(contracts.organizationId, orgId))
                });
                if (!contract) throw new Error('Contract not found');
            }

            // Verify job if provided
            if (body.jobId) {
                const job = await tx.query.jobs.findFirst({
                    where: and(eq(jobs.id, body.jobId), eq(jobs.organizationId, orgId))
                });
                if (!job) throw new Error('Job not found');
            }

            const [invoice] = await tx.insert(invoices).values(body).returning();

            if (!invoice) throw new Error('Failed to create invoice');

            // Create entries
            const entriesWithId = entriesData.map((entry: any) => ({
                ...entry,
                invoiceId: invoice.id,
                updatedByUserId: req.auth.id
            }));

            await tx.insert(invoiceEntries).values(entriesWithId);

            // Legacy returned invoice WITH entries in `InvoiceEntries`?
            // Legacy: `include: req.body.InvoiceEntries && [InvoiceEntry]` => yes.
            // I'll reconstruct it.
            const response = {
                ...invoice,
                invoiceEntries: entriesWithId // or fetch from DB?
            };

            return res.status(201).json(createSuccessResponse(response))
        })
    } catch (e: any) {
        return res.status(400).json(createErrorResponse('Error creating invoice', e))
    }
}
