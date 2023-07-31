const request = require('supertest')
const app = require('../../../../server')
const { Organization, sequelize } = require('../../../../db')

let orgId

beforeAll(async () => {
    const orgResuts = await Organization.findAll()
    orgId = orgResuts[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Get all organization expenses', () => {
    it('should return all organization expenses with expanded ExpenseEntries', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/expenses?expand=true`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(Array.isArray(data)).toBe(true)
        expect(data.length).toBeGreaterThan(0)

        const expense = data[0]
        expect(expense).toHaveProperty('id')
        expect(expense).toHaveProperty('description')
        expect(expense).toHaveProperty('date')
        expect(expense).toHaveProperty('createdAt')
        expect(expense).toHaveProperty('updatedAt')
        expect(expense).toHaveProperty('ContractId')
        expect(expense).toHaveProperty('OrganizationId', orgId)
        expect(expense).toHaveProperty('JobId')
        expect(expense).toHaveProperty('VendorId')
        expect(expense).toHaveProperty('UpdatedByUserId')

        expect(Array.isArray(expense.ExpenseEntries)).toBe(true)
        expect(expense.ExpenseEntries.length).toBeGreaterThan(0)

        const expenseEntry = expense.ExpenseEntries[0]
        expect(expenseEntry).toHaveProperty('id')
        expect(expenseEntry).toHaveProperty('name')
        expect(expenseEntry).toHaveProperty('description')
        expect(expenseEntry).toHaveProperty('quantity')
        expect(expenseEntry).toHaveProperty('unitCost')
        expect(expenseEntry).toHaveProperty('createdAt')
        expect(expenseEntry).toHaveProperty('updatedAt')
        expect(expenseEntry).toHaveProperty('ExpenseId', expense.id)
    })

    it('should return all organization expenses without expanded ExpenseEntries', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/expenses`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(Array.isArray(data)).toBe(true)
        expect(data.length).toBeGreaterThan(0)

        const expense = data[0]
        expect(expense).toHaveProperty('id')
        expect(expense).toHaveProperty('description')
        expect(expense).toHaveProperty('date')
        expect(expense).toHaveProperty('createdAt')
        expect(expense).toHaveProperty('updatedAt')
        expect(expense).toHaveProperty('ContractId')
        expect(expense).toHaveProperty('OrganizationId', orgId)
        expect(expense).toHaveProperty('JobId')
        expect(expense).toHaveProperty('VendorId')
        expect(expense).toHaveProperty('UpdatedByUserId')

        expect(expense).not.toHaveProperty('ExpenseEntries')
    })

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .get(`/organizations/${invalidOrgId}/expenses?expand=true`)
            .expect(403)

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