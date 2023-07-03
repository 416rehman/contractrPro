const request = require('supertest')
const app = require('../../../../../server')
const {
    Organization,
    Expense,
    ExpenseEntry,
    sequelize,
} = require('../../../../../db')
const { Op } = require('sequelize')

let orgId, expenseId, entry, strangerEntry
beforeAll(async () => {
    const organization = await Organization.findAll({ limit: 1 })
    orgId = organization[0].id

    const expense = await Expense.findAll({
        where: { OrganizationId: orgId },
        limit: 1,
    })
    expenseId = expense[0].id

    entry = (
        await ExpenseEntry.findAll({
            where: { ExpenseId: expenseId },
        })
    )[0]

    strangerEntry = (
        await ExpenseEntry.findAll({
            where: {
                ExpenseId: {
                    [Op.ne]: expenseId,
                },
            },
        })
    )[0]
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
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
        expect(data.ExpenseId).toBe(expenseId)
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidExpenseId = 'invalid-expense-id'
        const entryId = entry.id

        const response = await request(app)
            .get(
                `/organizations/${orgId}/expenses/${invalidExpenseId}/entries/${entryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Expense ID is required')
    })

    it('should return 400 if expense entry ID is invalid', async () => {
        const invalidEntryId = 'invalid-entry-id'

        const response = await request(app)
            .get(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${invalidEntryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('ExpenseEntry ID is required')
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

        jest.spyOn(ExpenseEntry, 'findOne').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(
                `/organizations/${orgId}/expenses/${expenseId}/entries/${entryId}`
            )
            .expect(400)

        const { status, message } = response.body

        expect(status).toBe('error')
        expect(message).toBe('Something went wrong')
    })
})
