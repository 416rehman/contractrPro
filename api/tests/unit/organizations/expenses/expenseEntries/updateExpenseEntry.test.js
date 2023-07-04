const request = require('supertest')
const app = require('../../../../../server')
const {
    Organization,
    ExpenseEntry,
    Expense,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../utils/fake')

let orgId, expenseId, strangerExpenseId, expenseEntry
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

    expenseEntry = expense.ExpenseEntries[0]

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
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Update expense entry', () => {
    it('should update an existing expense entry', async () => {
        const entryId = expenseEntry.id
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.id).toBe(entryId)
        expect(data.name).toBe(requestBody.name)
        expect(data.description).toBe(requestBody.description)
        expect(data.unitCost).toBe(requestBody.unitCost)
        expect(data.quantity).toBe(requestBody.quantity)
        expect(data.ExpenseId).toBe(expenseId)
        expect(data.updatedAt).toBeDefined()
        expect(data.createdAt).toBeDefined()
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const entryId = expenseEntry.id
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${invalidOrgId}/expenses/${expenseId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidExpenseId = 'invalid-expense-id'
        const entryId = expenseEntry.id
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${invalidExpenseId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry ID is invalid', async () => {
        const invalidEntryId = 'invalid-entry-id'
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${invalidEntryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry is not found', async () => {
        const nonExistingEntryId = 'non-existing-entry-id'
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${nonExistingEntryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry does not belong to the organization', async () => {
        const entryId = expenseEntry.id
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${strangerExpenseId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an error occurs during the update', async () => {
        // Mock the transaction to throw an error
        jest.spyOn(ExpenseEntry, 'update').mockImplementation(() => {
            throw new Error('Something went wrong')
        })

        const entryId = expenseEntry.id
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
