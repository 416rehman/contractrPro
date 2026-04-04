const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { organizations, expenses, expenseEntries } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgId, expense, strangerExpense

beforeAll(async () => {
    const orgResuts = await db.select().from(organizations)
    orgId = orgResuts[0].id
    const [e1] = await db.insert(expenses).values({
        ...fake.mockExpenseData(),
        organizationId: orgId,
    }).returning()
    expense = e1

    const [e1Entry] = await db.insert(expenseEntries).values({
        ...fake.mockExpenseEntryData(),
        expenseId: expense.id,
    }).returning()
    
    expense.ExpenseEntries = [e1Entry]
    const [e2] = await db.insert(expenses).values({
        ...fake.mockExpenseData(),
        organizationId: orgResuts[1]?.id || orgId,
    }).returning()
    strangerExpense = e2

    const [e2Entry] = await db.insert(expenseEntries).values({
        ...fake.mockExpenseEntryData(),
        expenseId: strangerExpense.id,
    }).returning()

    strangerExpense.ExpenseEntries = [e2Entry]
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
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
        expect(expenseEntry).toHaveProperty('unitCost')
        expect(expenseEntry).toHaveProperty('createdAt')
        expect(expenseEntry).toHaveProperty('updatedAt')
        expect(expenseEntry).toHaveProperty('expenseId', body.id)
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
        const invalidexpenseId = 'invalid-expense-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${invalidexpenseId}`)
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
