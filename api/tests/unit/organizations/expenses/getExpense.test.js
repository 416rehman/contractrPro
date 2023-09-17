const request = require('supertest')
const app = require('../../../../src/server')
const {
    Organization,
    Expense,
    ExpenseEntry,
    sequelize,
} = require('../../../../db')
const fake = require('../../../../src/utils/fake')

let orgId, expense, strangerExpense

beforeAll(async () => {
    const orgResuts = await Organization.findAll()
    orgId = orgResuts[0].id
    expense = await Expense.create(
        {
            ...fake.mockExpenseData(),
            OrganizationId: orgId,
            ExpenseEntries: [fake.mockExpenseEntryData()],
        },
        {
            include: {
                model: ExpenseEntry,
            },
        }
    )
    strangerExpense = await Expense.create(
        {
            ...fake.mockExpenseData(),
            OrganizationId: orgResuts[1].id,
            ExpenseEntries: [fake.mockExpenseEntryData()],
        },
        {
            include: {
                model: ExpenseEntry,
            },
        }
    )
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Get all organization expenses', () => {
    it('should return the expense with its ExpenseEntries', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${expense.id}`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')

        const body = data
        expect(body).toHaveProperty('id')
        expect(body).toHaveProperty('description')
        expect(body).toHaveProperty('date')
        expect(body).toHaveProperty('createdAt')
        expect(body).toHaveProperty('updatedAt')
        expect(body).toHaveProperty('ContractId')
        expect(body).toHaveProperty('OrganizationId', orgId)
        expect(body).toHaveProperty('JobId')
        expect(body).toHaveProperty('VendorId')
        expect(body).toHaveProperty('UpdatedByUserId')

        expect(Array.isArray(body.ExpenseEntries)).toBe(true)
        expect(body.ExpenseEntries.length).toBeGreaterThan(0)

        const expenseEntry = body.ExpenseEntries[0]
        expect(expenseEntry).toHaveProperty('id')
        expect(expenseEntry).toHaveProperty('name')
        expect(expenseEntry).toHaveProperty('description')
        expect(expenseEntry).toHaveProperty('quantity')
        expect(expenseEntry).toHaveProperty('unitPrice')
        expect(expenseEntry).toHaveProperty('createdAt')
        expect(expenseEntry).toHaveProperty('updatedAt')
        expect(expenseEntry).toHaveProperty('ExpenseId', body.id)
    })

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .get(`/organizations/${invalidOrgId}/expenses?expand=true`)
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidExpenseId = 'invalid-expense-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${invalidExpenseId}`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if the expense does not belong to the organization', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${strangerExpense.id}`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        jest.spyOn(sequelize, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/expenses?expand=true`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})