const request = require('supertest')
const app = require('../../../../../server')
const { Organization, Client, sequelize } = require('../../../../../db')
const fake = require('../../../../../utils/fake')
const fs = require('fs')

let orgId, clientId, strangerOrganizationId, strangerClientId
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

    const strangerClient = await Client.create({
        ...fake.mockClientData(),
        OrganizationId: strangerOrganizationId,
    })
    strangerClientId = strangerClient.id

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

describe('Create comment for client', () => {
    it('should create a comment for a client with no attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
            .send(commentData)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe(commentData.content)
    })

    it('should create a comment for a client with attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
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
            .post(`/organizations/${invalidOrgId}/clients/${clientId}/comments`)
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if client ID is invalid', async () => {
        const invalidClientId = 'invalid-client-id'

        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${invalidClientId}/comments`)
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is missing', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is empty and no attachments', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
            .field('content', '')
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should create a comment if content is empty and attachments are present', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
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
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
            .send({ content })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if the client is not in the organization', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/clients/${strangerClientId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
