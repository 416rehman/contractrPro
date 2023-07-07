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
const fs = require('fs')

let orgId, expenseId, strangerOrganizationId, strangerExpenseId, clientId
let fileContent, fileToAttachName
beforeAll(async () => {
    const org = await Organization.findAll()
    orgId = org[0].id
    strangerOrganizationId = org[1].id

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

    const strangerExpense = await Expense.create({
        ...fake.mockExpenseData(),
        OrganizationId: strangerOrganizationId,
        ClientId: clientId,
    })
    strangerExpenseId = strangerExpense.id

    // create a file and get its absolute path
    fileContent = 'test'
    fileToAttachName = 'test.txt'
    fs.writeFileSync(`./${fileToAttachName}`, fileContent)
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Delete comment for expense', () => {
    it('should delete a comment for a expense', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            ExpenseId: expenseId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/comments/${comment.id}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should not delete a comment for a expense that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            ExpenseId: strangerExpenseId,
            OrganizationId: strangerOrganizationId,
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${strangerExpenseId}/comments/${comment.id}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should not delete a comment for a expense that does not exist', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/comments/999999`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
