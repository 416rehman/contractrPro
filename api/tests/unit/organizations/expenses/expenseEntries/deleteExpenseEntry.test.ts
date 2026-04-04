const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { expenseEntries, organizations, expenses } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, expenseId, strangerexpenseId, expenseEntryId

beforeAll(async () => {
    const orgResults = await db.select().from(organizations)
    orgId = orgResults[0].id

    const [expense] = await db.insert(expenses).values({
...fake.mockExpenseData(),
organizationId: orgId
}).returning();
const [entry] = await db.insert(expenseEntries).values({ ...fake.mockExpenseEntryData(), expenseId: expense ? expense.id : strangerExpense.id }).returning()
    expenseId = expense.id

    const [strangerExpense] = await db.insert(expenses).values({
...fake.mockExpenseData(),
organizationId: orgResults[1] ? orgResults[1].id : (orgResults[1]?.id || orgResults[0].id)
}).returning();
const [entry] = await db.insert(expenseEntries).values({ ...fake.mockExpenseEntryData(), expenseId: expense ? expense.id : strangerExpense.id }).returning()
    strangerexpenseId = strangerExpense.id

    expenseEntryId = expense.ExpenseEntries[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Delete expense entry', () => {
    it('should delete an existing expense entry', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${expenseEntryId}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidexpenseId = 'invalid-expense-id'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${invalidexpenseId}/entries/${expenseEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry ID is invalid', async () => {
        const invalidExpenseEntryId = 'invalid-expense-entry-id'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${invalidExpenseEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry is not found', async () => {
        const nonExistingExpenseEntryId = '00000000-0000-0000-0000-000000000000'

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${nonExistingExpenseEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry does not belong to the organization', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${strangerexpenseId}/entries/${expenseEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        // Mock an exception by throwing an error inside the transaction
        jest.spyOn(db, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${expenseEntryId}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
