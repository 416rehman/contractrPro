const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { organizations, expenses, expenseEntries } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, expenseId, strangerexpenseId
beforeAll(async () => {
    const orgResults = await db.select().from(organizations)
    orgId = orgResults[0].id

    const [expense] = await db.insert(expenses).values({
        ...fake.mockExpenseData(),
        organizationId: orgId,
    }).returning()
    expenseId = expense.id
    const [entry] = await db.insert(expenseEntries).values({ ...fake.mockExpenseEntryData(), expenseId: expense ? expense.id : strangerExpense.id }).returning()

    const [strangerExpense] = await db.insert(expenses).values({
        ...fake.mockExpenseData(),
        organizationId: orgResults[1].id,
    }).returning()
    strangerexpenseId = strangerExpense.id
    const [entry] = await db.insert(expenseEntries).values({ ...fake.mockExpenseEntryData(), expenseId: expense ? expense.id : strangerExpense.id }).returning()
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
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
        expect(data.unitCost).toBe(requestBody.unitCost)
        expect(data.quantity).toBe(requestBody.quantity)
        expect(data.expenseId).toBe(expenseId)
        expect(data.updatedAt).toBeDefined()
        expect(data.createdAt).toBeDefined()

        // Cleanup
        if (response?.body?.data?.id) {
            await db.delete(expenseEntries).where(eq(expenseEntries.id, response.body.data.id))
        }
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidexpenseId = 'invalid-expense-id'
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .post(
                `/organizations/${orgId}/expenses/${invalidexpenseId}/entries`
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
                `/organizations/${orgId}/expenses/${strangerexpenseId}/entries`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const requestBody = fake.mockExpenseEntryData()

        jest.spyOn(db, 'transaction').mockImplementationOnce(() => {
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
