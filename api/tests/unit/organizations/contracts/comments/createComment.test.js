const request = require('supertest')
const app = require('../../../../../server')
const {
    Client,
    Organization,
    Contract,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../utils/fake')
const fs = require('fs')

let orgId, contractId, strangerOrganizationId, strangerContractId, clientId
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

    const contract = await Contract.create({
        ...fake.mockContractData(),
        OrganizationId: orgId,
        ClientId: clientId,
    })
    contractId = contract.id

    const strangerContract = await Contract.create({
        ...fake.mockContractData(),
        OrganizationId: strangerOrganizationId,
        ClientId: clientId,
    })
    strangerContractId = strangerContract.id

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

describe('Create comment for contract', () => {
    it('should create a comment for a contract with no attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(`/organizations/${orgId}/contracts/${contractId}/comments`)
            .send(commentData)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe(commentData.content)
    })

    it('should create a comment for a contract with attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(`/organizations/${orgId}/contracts/${contractId}/comments`)
            .field('content', commentData.content)
            .attach('attachments', fileToAttachPath)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe(commentData.content)
        expect(data.Attachments).toBeDefined()
        expect(Array.isArray(data.Attachments)).toBe(true)
        expect(data.Attachments.length).toBe(1)
        expect(data.Attachments[0].filename).toBe(fileToAttachName)
    })

    it('should return 400 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .post(
                `/organizations/${invalidOrgId}/contracts/${contractId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if contract ID is invalid', async () => {
        const invalidContractId = 'invalid-contract-id'

        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${invalidContractId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is missing', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/contracts/${contractId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is empty and no attachments', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/contracts/${contractId}/comments`)
            .field('content', '')
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should create a comment if content is empty and attachments are present', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/contracts/${contractId}/comments`)
            .field('content', '')
            .attach('attachments', fileToAttachPath)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe('')
        expect(data.Attachments).toBeDefined()
        expect(Array.isArray(data.Attachments)).toBe(true)
        expect(data.Attachments.length).toBe(1)
        expect(data.Attachments[0].filename).toBe(fileToAttachName)
    })

    it('should return 400 if comment content is too long', async () => {
        const content = 'a'.repeat(10000)
        const response = await request(app)
            .post(`/organizations/${orgId}/contracts/${contractId}/comments`)
            .send({ content })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if the contract is not in the organization', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${strangerContractId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
