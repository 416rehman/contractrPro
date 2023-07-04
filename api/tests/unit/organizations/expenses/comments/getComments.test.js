const request = require('supertest')
const app = require('../../../../../server')
const {
    Comment,
    Organization,
    Client,
    Expense,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../utils/fake')

let orgId, expenseId, comment, clientId
beforeAll(async () => {
    const org = await Organization.findAll({ limit: 1 })
    orgId = org[0].id

    const client = await Client.create({
        ...fake.mockClientData(),
        OrganizationId: orgId,
    })
    clientId = client.id

    const expense = await Expense.create({
        ...fake.mockExpenseData(),
        OrganizationId: orgId,
        ClientId: clientId,
    })
    expenseId = expense.id

    comment = await Comment.create({
        ...fake.mockCommentData(),
        OrganizationId: orgId,
        ExpenseId: expenseId,
        AuthorId: process.env.DEV_USER_UUID,
    })
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Get comments for expense', () => {
    it('should get comments for a expense', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.comments).toBeDefined()
        expect(Array.isArray(data.comments)).toBe(true)
        expect(data.comments.length).toBeGreaterThan(0)

        // expect comment to be in the response
        const commentInResponse = data.comments.find((c) => c.id === comment.id)
        expect(commentInResponse).toBeDefined()
        expect(commentInResponse.content).toBe(comment.content)
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .get(
                `/organizations/${invalidOrgId}/expenses/${expenseId}/comments`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidExpenseId = 'invalid-expense-id'

        const response = await request(app)
            .get(
                `/organizations/${orgId}/expenses/${invalidExpenseId}/comments`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense does not belong to organization', async () => {
        const expenseId = 'non-existing-expense-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an error occurs during the transaction', async () => {
        // Mock the transaction to throw an error
        jest.spyOn(Comment, 'findAndCountAll').mockImplementation(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
