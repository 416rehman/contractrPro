const request = require('supertest')
const app = require('../../../../../server')
const {
    Client,
    Organization,
    Expense,
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

describe('Create comment for expense', () => {
    it('should create a comment for a expense with no attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .send(commentData)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe(commentData.content)
    })

    it('should create a comment for a expense with attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .field('content', commentData.content)
            .attach('Attachments', fileToAttachPath)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe(commentData.content)
        expect(data.Attachments).toBeDefined()
        expect(Array.isArray(data.Attachments)).toBe(true)
        expect(data.Attachments.length).toBe(1)
        expect(data.Attachments[0].name).toBe(fileToAttachName)
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .post(
                `/organizations/${invalidOrgId}/expenses/${expenseId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidExpenseId = 'invalid-expense-id'

        const response = await request(app)
            .post(
                `/organizations/${orgId}/expenses/${invalidExpenseId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is missing', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is empty and no attachments', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .field('content', '')
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should create a comment if content is empty and attachments are present', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .field('content', '')
            .attach('Attachments', fileToAttachPath)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe('')
        expect(data.Attachments).toBeDefined()
        expect(Array.isArray(data.Attachments)).toBe(true)
        expect(data.Attachments.length).toBe(1)
        expect(data.Attachments[0].name).toBe(fileToAttachName)
    })

    it('should return 400 if comment content is too long', async () => {
        const content = 'a'.repeat(10000)
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .send({ content })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if the expense is not in the organization', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/expenses/${strangerExpenseId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})