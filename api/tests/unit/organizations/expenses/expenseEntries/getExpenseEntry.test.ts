const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { organizations, expenses, expenseEntries } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, expenseId, entry, strangerEntry
beforeAll(async () => {
    const orgResults = await db.select().from(organizations)
    orgId = orgResults[0].id

    const [expense] = await db.insert(expenses).values({
...fake.mockExpenseData(),
organizationId: orgId
}).returning();
const [entry] = await db.insert(expenseEntries).values({ ...fake.mockExpenseEntryData(), expenseId: expense ? expense.id : strangerExpense.id }).returning()
    strangerEntry = strangerExpense.ExpenseEntries[0]
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Get expense entry', () => {
    it('should return the expense entry', async () => {
        const entryId = entry.id

        const response = await request(app)
            .get(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${entryId}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.id).toBe(entryId)
        expect(data.name).toBe(entry.name)
        expect(data.description).toBe(entry.description)
        expect(data.quantity).toBe(entry.quantity)
        expect(data.unitCost).toBe(entry.unitCost)
        expect(data.expenseId).toBe(expenseId)
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidexpenseId = 'invalid-expense-id'
        const entryId = entry.id

        const response = await request(app)
            .get(
                `/organizations/${orgId}/expenses/${invalidexpenseId}/entries/${entryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry ID is invalid', async () => {
        const invalidEntryId = 'invalid-entry-id'

        const response = await request(app)
            .get(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${invalidEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry does not belong to expense', async () => {
        const entryId = strangerEntry.id

        const response = await request(app)
            .get(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${entryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const entryId = entry.id

        jest.spyOn(db, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${entryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
