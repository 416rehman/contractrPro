const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { organizations, expenseEntries, expenses } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, expenseId, strangerexpenseId, expenseEntry
beforeAll(async () => {
    const orgResults = await db.select().from(organizations)
    orgId = orgResults[0].id

    const [expense] = await db.insert(expenses).values({
...fake.mockExpenseData(),
organizationId: orgId
}).returning();
const [expenseEntry1] = await db.insert(expenseEntries).values({ ...fake.mockExpenseEntryData(), expenseId: expense.id }).returning()
    expenseId = expense.id

    expenseEntry = expenseEntry1

    const [strangerExpense] = await db.insert(expenses).values({
...fake.mockExpenseData(),
organizationId: orgResults[1] ? orgResults[1].id : (orgResults[1]?.id || orgResults[0].id)
}).returning();
const [expenseEntry2] = await db.insert(expenseEntries).values({ ...fake.mockExpenseEntryData(), expenseId: strangerExpense.id }).returning()
    strangerexpenseId = strangerExpense.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Update expense entry', () => {
    it('should update an existing expense entry', async () => {
        const entryId = expenseEntry.id
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.id).toBe(entryId)
        expect(data.name).toBe(requestBody.name)
        expect(data.description).toBe(requestBody.description)
        expect(data.unitCost).toBe(requestBody.unitCost)
        expect(data.quantity).toBe(requestBody.quantity)
        expect(data.expenseId).toBe(expenseId)
        expect(data.updatedAt).toBeDefined()
        expect(data.createdAt).toBeDefined()
    })

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const entryId = expenseEntry.id
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${invalidOrgId}/expenses/${expenseId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidexpenseId = 'invalid-expense-id'
        const entryId = expenseEntry.id
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${invalidexpenseId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry ID is invalid', async () => {
        const invalidEntryId = 'invalid-entry-id'
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${invalidEntryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry is not found', async () => {
        const nonExistingEntryId = 'non-existing-entry-id'
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${nonExistingEntryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense entry does not belong to the organization', async () => {
        const entryId = expenseEntry.id
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${strangerexpenseId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an error occurs during the update', async () => {
        // Mock the transaction to throw an error
        jest.spyOn(db, 'transaction').mockImplementation(() => {
            throw new Error('Something went wrong')
        })

        const entryId = expenseEntry.id
        const requestBody = fake.mockExpenseEntryData()

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${entryId}`
            )
            .send(requestBody)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
