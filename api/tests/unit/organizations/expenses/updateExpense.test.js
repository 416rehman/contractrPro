const request = require('supertest')
const app = require('../../../../server')
const {
    Expense,
    Organization,
    sequelize,
    ExpenseEntry,
} = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgId, orgExpense

beforeAll(async () => {
    const orgResults = await Organization.findAll()
    orgId = orgResults[0].id
    orgExpense = await Expense.create(
        {
            ...fake.mockExpenseData(),
            OrganizationId: orgId,
            ExpenseEntries: [fake.mockExpenseEntryData()],
        },
        {
            include: [ExpenseEntry],
        }
    )
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Update expense', () => {
    it('should update the expense and return the updated expense with ExpenseEntries', async () => {
        const expenseId = orgExpense.id

        const requestBody = fake.mockExpenseData()
        requestBody.ExpenseEntries = []
        requestBody.ExpenseEntries.push(fake.mockExpenseEntryData())

        const response = await request(app)
            .put(`/organizations/${orgId}/expenses/${expenseId}`)
            .send(requestBody)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toHaveProperty('id', expenseId)
        expect(data).toHaveProperty('description', requestBody.description)
        expect(data).toHaveProperty('OrganizationId', orgId)
        expect(data).toHaveProperty('UpdatedByUserId')

        expect(data.ExpenseEntries).not.toBe(orgExpense.ExpenseEntries)
    })

    it('should update without replacing the current expense entries if no new entries are provided', async () => {
        const expenseId = orgExpense.id

        const requestBody = fake.mockExpenseData()

        const response = await request(app)
            .put(`/organizations/${orgId}/expenses/${expenseId}`)
            .send(requestBody)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toHaveProperty('id', expenseId)
        expect(data).toHaveProperty('description', requestBody.description)
        expect(data).toHaveProperty('OrganizationId', orgId)
        expect(data).toHaveProperty('UpdatedByUserId')

        expect(data.ExpenseEntries[0]).toBeDefined()
        expect(data.ExpenseEntries[0]).toHaveProperty('id')
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const expenseId = orgExpense.id

        const response = await request(app)
            .put(`/organizations/${invalidOrgId}/expenses/${expenseId}`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidExpenseId = 'invalid-expense-id'

        const response = await request(app)
            .put(`/organizations/${orgId}/expenses/${invalidExpenseId}`)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Invalid expense_id')
    })

    it('should return 400 if expense is not found', async () => {
        const expenseId = 'non-existing-expense-id'

        const requestBody = fake.mockExpenseData()

        const response = await request(app)
            .put(`/organizations/${orgId}/expenses/${expenseId}`)
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const expenseId = orgExpense.id
        const requestBody = fake.mockExpenseData()

        jest.spyOn(Expense.prototype, 'update').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .put(`/organizations/${orgId}/expenses/${expenseId}`)
            .send(requestBody)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
