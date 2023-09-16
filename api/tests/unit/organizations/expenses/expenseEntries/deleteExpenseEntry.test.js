const request = require('supertest')
const app = require('../../../../../src/server')
const {
    ExpenseEntry,
    Organization,
    Expense,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../src/utils/fake')

let orgId, expenseId, strangerExpenseId, expenseEntryId

beforeAll(async () => {
    const orgResults = await Organization.findAll()
    orgId = orgResults[0].id

    const expense = await Expense.create(
        {
            ...fake.mockExpenseData(),
            OrganizationId: orgId,
            ExpenseEntries: [fake.mockExpenseEntryData()],
        },
        {
            include: [ExpenseEntry],
        }
    )
    expenseId = expense.id

    const strangerExpense = await Expense.create(
        {
            ...fake.mockExpenseData(),
            OrganizationId: orgResults[1].id,
            ExpenseEntries: [fake.mockExpenseEntryData()],
        },
        {
            include: [ExpenseEntry],
        }
    )
    strangerExpenseId = strangerExpense.id

    expenseEntryId = expense.ExpenseEntries[0].id
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

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry ID is invalid', async () => {
        const invalidExpenseEntryId = 'invalid-expense-entry-id'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${invalidExpenseEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry is not found', async () => {
        const nonExistingExpenseEntryId = '00000000-0000-0000-0000-000000000000'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${nonExistingExpenseEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry does not belong to the organization', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${strangerExpenseId}/entries/${expenseEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
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

        const { status } = response.body

        expect(status).toBe('error')
    })
})
