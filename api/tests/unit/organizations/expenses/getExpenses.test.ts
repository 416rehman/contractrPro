const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { organizations } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'


let orgId

beforeAll(async () => {
    const orgResuts = await db.select().from(organizations)
    orgId = orgResuts[0].id

    const [expense] = await db.insert(expenses).values({
        ...fake.mockExpenseData(),
        organizationId: orgId,
    }).returning()
    await db.insert(expenseEntries).values({
        ...fake.mockExpenseEntryData(),
        expenseId: expense.id,
    })
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
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
        expect(expenseEntry).toHaveProperty('expenseId', expense.id)
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
        jest.spyOn(db, 'select').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/expenses?expand=true`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
