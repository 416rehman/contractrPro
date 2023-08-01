const { sequelize, Expense, ExpenseEntry } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
const { pick } = require('../../../utils/index')

module.exports = async (req, res) => {
    try {
        const { org_id, expense_id } = req.params
        if (!org_id || !isValidUUID(org_id)) {
            return res.status(400).json(createErrorResponse('Invalid org_id'))
        }
        if (!expense_id || !isValidUUID(expense_id)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid expense_id'))
        }

        const ExpenseEntries =
            req.body?.ExpenseEntries?.map((entry) =>
                pick(entry, ['description', 'quantity', 'unitCost', 'name'])
            ) || []

        if (ExpenseEntries.length === 0) {
            return res
                .status(400)
                .json(
                    createErrorResponse(
                        'ExpenseEntries is required. Provide at least one entry, like this: { "ExpenseEntries": [{ "description": "some description", "quantity": 1, "unitPrice": 100, "name": "some name" }] }'
                    )
                )
        }

        const body = {
            ...pick(req.body, [
                'description',
                'date',
                'taxRate',
                'VendorId',
                'ContractId',
                'JobId',
            ]),
            ExpenseEntries,
            OrganizationId: org_id,
            UpdatedByUserId: req.auth.id,
        }

        console.log('body', body)

        await sequelize.transaction(async (transaction) => {
            let expense = await Expense.findOne({
                where: {
                    OrganizationId: org_id,
                    id: expense_id,
                },
                transaction,
            })

            if (!expense) {
                return res
                    .status(400)
                    .json(createErrorResponse('Expense not found'))
            }

            await expense.update(body, {
                transaction,
            })

            if (ExpenseEntries && ExpenseEntries.length > 0) {
                // delete all existing entries first
                await ExpenseEntry.destroy({
                    where: {
                        ExpenseId: expense.id,
                    },
                })

                // create new entries
                await ExpenseEntry.bulkCreate(
                    ExpenseEntries.map((entry) => ({
                        ...entry,
                        ExpenseId: expense.id,
                        UpdatedByUserId: req.auth.id,
                    })),
                    {
                        transaction,
                    }
                )

                // re-fetch expenseEntries with entries
                expense = await Expense.findOne({
                    where: {
                        OrganizationId: org_id,
                        id: expense_id,
                    },
                    transaction,
                    include: {
                        model: ExpenseEntry,
                    },
                })
            }

            res.status(200).json(createSuccessResponse(expense))
        })
    } catch (e) {
        return res.status(400).json(createErrorResponse(e.message))
    }
}
