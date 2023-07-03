const { sequelize, Expense, ExpenseEntry } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
const { pick } = require('../../../utils/index')

// update expense
// Example request body:
// {
//         "description": "Quod omnis pariatur non facere odio.",
//         "date": "2023-04-05T12:00:08.085Z",
//         "VendorId": "b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1",
//         "ExpenseEntries": [{
//             "name": "paid joemama1",
//             "description": "whatever1",
//             "quantity": 5,
//             "unitCost": 10,
//         }]
// }
// NOTE: ExpenseEntries is optional - if provided, it will REPLACE all existing entries
// NOTE: ContractId, and JobId are optional entities to associate with the expense
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

        const body = {
            ...pick(req.body, [
                'description',
                'date',
                'VendorId',
                'ContractId',
                'JobId',
            ]),
            OrganizationId: org_id,
            UpdatedByUserId: req.auth.id,
        }

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

            if (req.body.ExpenseEntries && req.body.ExpenseEntries.length > 0) {
                // delete all existing entries first
                await ExpenseEntry.destroy({
                    where: {
                        ExpenseId: expense.id,
                    },
                })

                // create new entries
                await ExpenseEntry.bulkCreate(
                    req.body.ExpenseEntries.map((entry) => ({
                        ...entry,
                        ExpenseId: expense.id,
                        UpdatedByUserId: req.auth.id,
                    })),
                    {
                        transaction,
                    }
                )

                // re-fetch expense with entries
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
