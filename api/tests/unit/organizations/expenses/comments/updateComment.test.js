const request = require('supertest')
const app = require('../../../../../server')
const {
    Comment,
    Organization,
    Client,
    Expense,
    Attachment,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../utils/fake')
const fs = require('fs')

let orgId, expenseId, strangerOrganizationId, strangerExpenseId, clientId
let fileToAttachPath, fileContent, fileToAttachName
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
    fileToAttachPath = fs.realpathSync(`./${fileToAttachName}`)
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Update comment for expense', () => {
    it('should update a comment for a expense', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            ExpenseId: expenseId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/comments/${comment.id}`
            )
            .send({ content: 'new content' })
            .expect(200)

        const { status } = response.body

        expect(status).toBe('success')

        // get the updated comment
        const updatedComment = await Comment.findByPk(comment.id)
        expect(updatedComment.content).toBe('new content')
    })

    it('should not update a comment for a expense that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            ExpenseId: strangerExpenseId,
            OrganizationId: strangerOrganizationId,
        })

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${strangerExpenseId}/comments/${comment.id}`
            )
            .send({ content: 'new content' })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should update a comment for a expense with attachments', async () => {
        const comment = await Comment.create({
            content: 'Original content',
            ExpenseId: expenseId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/comments/${comment.id}`
            )
            .field('content', 'new content')
            .attach('attachments', fileToAttachPath) // Pass a single file path
            .expect(200)

        const { status } = response.body
        expect(status).toBe('success')

        // // delay to wait for the file to be uploaded to s3
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Get the updated comment
        const updatedComment = await Comment.findByPk(comment.id, {
            include: [
                {
                    model: Attachment,
                },
            ],
        })
        expect(updatedComment.content).toBe('new content')
        expect(updatedComment.Attachments.length).toBe(1)
    })
})
