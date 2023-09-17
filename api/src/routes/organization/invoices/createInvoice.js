const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { zInvoiceEntry, zInvoice } = require('../../../validators/invoice.zod')

// create invoice
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id

        const InvoiceEntries = req.body?.InvoiceEntries?.map((entry) => {
            return zInvoiceEntry.parse(entry)
        })
        if (!InvoiceEntries || InvoiceEntries.length === 0) {
            throw new Error(
                'InvoiceEntries is required. Provide at least one entry, like this: { "InvoiceEntries": [{ "description": "some description", "quantity": 1, "unitPrice": 100, "name": "some name" }] }'
            )
        }

        const data = zInvoice.parse(req.body)
        const include = {
            InvoiceEntries: true,
        }
        data.organizationId = orgId
        data.updatedByUserId = req.auth.id
        data.InvoiceEntries = {
            create: InvoiceEntries,
        }

        // Contract Linking - make sure the contract belongs to the org
        if (data.contractId) {
            const contract = await prisma.contract.findUnique({
                where: {
                    id: data.contractId,
                    organizationId: orgId,
                },
            })
            if (!contract) {
                throw new Error('Contract not found')
            }
        }

        // Job Linking - make sure the job belongs a contract that belongs to the org
        if (data.jobId) {
            const job = await prisma.job.findUnique({
                where: {
                    id: data.jobId,
                    Contract: {
                        organizationId: orgId,
                    },
                },
                include: {
                    Contract: true,
                },
            })
            if (!job) {
                throw new Error('Job not found')
            }
            data.contractId = job.Contract.id
        }

        const invoice = await prisma.invoice.create({
            data,
            include,
        })
        return res.status(201).json(createSuccessResponse(invoice))
    } catch (e) {
        return res.status(400).json(createErrorResponse(e.message))
    }
}