const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { organizations, expenses, expenseEntries } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, expenseId
beforeAll(async () => {
    const organization = await db.select().from(organizations).limit(1)
    orgId = organization[0].id

    const expense = await db.insert(expenses).values({ organizationId: orgId, ...fake.mockExpenseData() }).returning().then(async (expensesArr) => {
        const exp = expensesArr[0];
        const [entry] = await db.insert(expenseEntries).values({ ...fake.mockExpenseEntryData(), expenseId: expense ? expense.id : strangerExpense.id }).returning();
        return exp;
    })
    expenseId = expense.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
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
        const invalidexpenseId = 'invalid-expense-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${invalidexpenseId}/entries`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        jest.spyOn(db, 'select').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${expenseId}/entries`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
