const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { zExpenseEntry, zExpense } = require('../../../validators/expense.zod')

// create expense
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id

        const ExpenseEntries = req.body?.ExpenseEntries?.map((entry) => {
            return zExpenseEntry.parse(entry)
        })
        if (!ExpenseEntries || ExpenseEntries.length === 0) {
            throw new Error(
                'ExpenseEntries is required. Provide at least one entry, like this: { "ExpenseEntries": [{ "description": "some description", "quantity": 1, "unitPrice": 100, "name": "some name" }] }'
            )
        }

        const data = zExpense.parse(req.body)
        const include = {
            ExpenseEntries: true,
        }
        data.organizationId = orgId
        data.updatedByUserId = req.auth.id
        data.ExpenseEntries = ExpenseEntries

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

        const expense = await prisma.expense.create({
            data,
            include,
        })
        return res.status(201).json(createSuccessResponse(expense))
    } catch (e) {
        return res.status(400).json(createErrorResponse(e.message))
    }
}