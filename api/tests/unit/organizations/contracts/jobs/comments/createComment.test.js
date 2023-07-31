const request = require('supertest')
const app = require('../../../../../../server')
const {
    Contract,
    Client,
    Organization,
    Job,
    sequelize,
} = require('../../../../../../db')
const fake = require('../../../../../../utils/fake')
const fs = require('fs')

let orgId, jobId, strangerOrganizationId, strangerJobId, clientId, contractId
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

    const job = await Job.create({
        ...fake.mockJobData(),
        ContractId: contractId,
        OrganizationId: orgId,
        ClientId: clientId,
    })
    jobId = job.id

    const strangerJob = await Job.create({
        ...fake.mockJobData(),
        OrganizationId: strangerOrganizationId,
        ClientId: clientId,
        ContractId: strangerContract.id,
    })
    strangerJobId = strangerJob.id

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

describe('Create comment for job', () => {
    it('should create a comment for a job with no attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .send(commentData)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe(commentData.content)
    })

    it('should create a comment for a job with attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
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

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .post(
                `/organizations/${invalidOrgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if job ID is invalid', async () => {
        const invalidJobId = 'invalid-job-id'

        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${invalidJobId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is missing', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is empty and no attachments', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .field('content', '')
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should create a comment if content is empty and attachments are present', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
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
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .send({ content })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if the job is not in the organization', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${strangerJobId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})