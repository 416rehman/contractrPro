const request = require('supertest')
const app = require('../../../../../src/server')
const {
    Organization,
    Expense,
    ExpenseEntry,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../src/utils/fake')

let orgId, expenseId, strangerExpenseId
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
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Create expense entry', () => {
    it('should create a new expense entry', async () => {
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/entries`)
            .send(requestBody)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.id).toBeDefined()
        expect(data.name).toBe(requestBody.name)
        expect(data.description).toBe(requestBody.description)
        expect(data.unitPrice).toBe(requestBody.unitPrice)
        expect(data.quantity).toBe(requestBody.quantity)
        expect(data.ExpenseId).toBe(expenseId)
        expect(data.updatedAt).toBeDefined()
        expect(data.createdAt).toBeDefined()

        // Cleanup
        if (response?.body?.data?.id) {
            await ExpenseEntry.destroy({
                where: { id: response.body.data.id },
            })
        }
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidExpenseId = 'invalid-expense-id'
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .post(
                `/organizations/${orgId}/expenses/${invalidExpenseId}/entries`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if trying to create an entry for an expense that does not belong to the organization', async () => {
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .post(
                `/organizations/${orgId}/expenses/${strangerExpenseId}/entries`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const requestBody = fake.mockExpenseEntryData()

        jest.spyOn(ExpenseEntry, 'create').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/entries`)
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})