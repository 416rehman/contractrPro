const request = require('supertest')
const app = require('../../../../../server')
const {
    ExpenseEntry,
    Organization,
    Expense,
    sequelize,
} = require('../../../../../db')
const { Op } = require('sequelize')
const fake = require('../../../../../utils/fake')

let orgId, expenseId, strangerExpenseId, expenseEntryId

beforeAll(async () => {
    const organization = await Organization.findAll({ limit: 1 })
    orgId = organization[0].id

    const expense = await Expense.findAll({
        where: { OrganizationId: orgId },
        limit: 1,
    })
    expenseId = expense[0].id
    const strangerExpense = await Expense.findAll({
        where: {
            OrganizationId: {
                [Op.ne]: orgId,
            },
        },
    })
    strangerExpenseId = strangerExpense[0].id

    const expenseEntryToDelete = await ExpenseEntry.create({
        ExpenseId: expenseId,
        ...fake.mockExpenseEntryData(),
    })
    expenseEntryId = expenseEntryToDelete.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Delete expense entry', () => {
    it('should delete an existing expense entry', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${expenseEntryId}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidExpenseId = 'invalid-expense-id'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${invalidExpenseId}/entries/${expenseEntryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Expense ID is required')
    })

    it('should return 400 if expense entry ID is invalid', async () => {
        const invalidExpenseEntryId = 'invalid-expense-entry-id'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${invalidExpenseEntryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('ExpenseEntry ID is required')
    })

    it('should return 400 if expense entry is not found', async () => {
        const nonExistingExpenseEntryId = '00000000-0000-0000-0000-000000000000'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${nonExistingExpenseEntryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('ExpenseEntry not found')
    })

    it('should return 400 if expense entry does not belong to the organization', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${strangerExpenseId}/entries/${expenseEntryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('ExpenseEntry not found')
    })

    it('should return 400 if an exception occurs', async () => {
        // Mock an exception by throwing an error inside the transaction
        jest.spyOn(ExpenseEntry, 'destroy').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${expenseEntryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
