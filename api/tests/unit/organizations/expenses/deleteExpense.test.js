const request = require('supertest')
const app = require('../../../../src/server')
const {
    Expense,
    Organization,
    ExpenseEntry,
    sequelize,
} = require('../../../../db')
const fake = require('../../../../src/utils/fake')

let orgId, expenseId

beforeAll(async () => {
    const orgResults = await Organization.findAll()
    orgId = orgResults[0].id
    const expenseToDelete = await Expense.create(
        {
            ...fake.mockExpenseData(),
            OrganizationId: orgId,
            ExpenseEntries: [fake.mockExpenseEntryData()],
        },
        {
            include: [ExpenseEntry],
        }
    )
    expenseId = expenseToDelete.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Delete expense', () => {
    it('should delete the expense and return the number of rows deleted', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/expenses/${expenseId}`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const response = await request(app)
            .delete(`/organizations/${invalidOrgId}/expenses/${expenseId}`)
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidExpenseId = 'invalid-expense-id'
        const response = await request(app)
            .delete(`/organizations/${orgId}/expenses/${invalidExpenseId}`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense is not found', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/expenses/999999`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        jest.spyOn(Expense, 'destroy').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .delete(`/organizations/${orgId}/expenses/${expenseId}`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
