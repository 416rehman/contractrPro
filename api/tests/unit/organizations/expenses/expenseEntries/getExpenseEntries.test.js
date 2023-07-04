const request = require('supertest')
const app = require('../../../../../server')
const {
    Organization,
    Expense,
    ExpenseEntry,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../utils/fake')

let orgId, expenseId
beforeAll(async () => {
    const organization = await Organization.findAll({ limit: 1 })
    orgId = organization[0].id

    const expense = await Expense.create(
        {
            OrganizationId: orgId,
            ...fake.mockExpenseData(),
            ExpenseEntries: [fake.mockExpenseEntryData()],
        },
        {
            include: {
                model: ExpenseEntry,
            },
        }
    )
    expenseId = expense.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Get expense entries', () => {
    it('should return the expense entries', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${expenseId}/entries`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(Array.isArray(data)).toBe(true)

        expect(data[0].id).toBeDefined()
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidExpenseId = 'invalid-expense-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${invalidExpenseId}/entries`)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Expense ID is required')
    })

    it('should return 400 if an exception occurs', async () => {
        jest.spyOn(ExpenseEntry, 'findAll').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${expenseId}/entries`)
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
