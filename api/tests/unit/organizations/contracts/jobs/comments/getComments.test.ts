const request = require('supertest')
const app = require('../../../../../../server')
const {
    Comment,
    Organization,
    Client,
    Job,
    Contract,
    sequelize,
} = require('../../../../../../db')
const fake = require('../../../../../../utils/fake')

let orgId, jobId, comment, clientId, contractId
beforeAll(async () => {
    const org = await Organization.findAll({ limit: 1 })
    orgId = org[0].id

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

    const job = await Job.create({
        ...fake.mockJobData(),
        ContractId: contractId,
        OrganizationId: orgId,
        ClientId: clientId,
    })
    jobId = job.id

    comment = await Comment.create({
        ...fake.mockCommentData(),
        OrganizationId: orgId,
        JobId: jobId,
        AuthorId: process.env.DEV_USER_UUID,
    })
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Get comments for job', () => {
    it('should get comments for a job', async () => {
        const response = await request(app)
            .get(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
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

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .get(
                `/organizations/${invalidOrgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if job ID is invalid', async () => {
        const invalidJobId = 'invalid-job-id'

        const response = await request(app)
            .get(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${invalidJobId}/comments`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if job does not belong to organization', async () => {
        const jobId = 'non-existing-job-id'

        const response = await request(app)
            .get(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
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
            .get(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
