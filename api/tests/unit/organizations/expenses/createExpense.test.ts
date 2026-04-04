const request = require('supertest')
const app = require('../../../../server')
import { db } from '../../../../db/index'
import { organizations } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgId

beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgId = orgs[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Create expense', () => {
    it('should create an expense with entries', async () => {
        const expenseData = fake.mockExpenseData()
        expenseData.ExpenseEntries = []
        expenseData.ExpenseEntries.push(fake.mockExpenseEntryData())

        const response = await request(app)
            .post(`/organizations/${orgId}/expenses`)
            .send(expenseData)
            .expect(201)

        const { status, data } = response.body
        const { id, description, ExpenseEntries } = data

        expect(status).toBe('success')
        expect(id).toBeTruthy()
        expect(description).toBe(expenseData.description)
        expect(ExpenseEntries).toBeInstanceOf(Array)
        expect(ExpenseEntries.length).toBeGreaterThan(0)
        expect(ExpenseEntries[0]).toHaveProperty('id')
        expect(ExpenseEntries[0]).toHaveProperty(
            'name',
            expenseData.ExpenseEntries[0].name
        )
        expect(ExpenseEntries[0]).toHaveProperty(
            'description',
            expenseData.ExpenseEntries[0].description
        )
        expect(ExpenseEntries[0]).toHaveProperty(
            'quantity',
            expenseData.ExpenseEntries[0].quantity
        )
        expect(ExpenseEntries[0]).toHaveProperty(
            'unitCost',
            expenseData.ExpenseEntries[0].unitCost
        )
        expect(ExpenseEntries[0]).toHaveProperty('ExpenseId', id)
    })

    it('should not create an expense without entries', async () => {
        const expenseData = fake.mockExpenseData()
        expenseData.ExpenseEntries = []

        await request(app)
            .post(`/organizations/${orgId}/expenses`)
            .send(expenseData)
            .expect(400)
    })

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const expenseData = fake.mockExpenseData()

        const response = await request(app)
            .post(`/organizations/${invalidOrgId}/expenses`)
            .send(expenseData)
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const expenseData = fake.mockExpenseData()

        jest.spyOn(db, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .post(`/organizations/${orgId}/expenses`)
            .send(expenseData)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
