const request = require('supertest')
const app = require('../../../../../../src/server')
const {
    Comment,
    Organization,
    Client,
    Job,
    Contract,
    sequelize,
} = require('../../../../../../db')
const fake = require('../../../../../../src/utils/fake')
const fs = require('fs')

let orgId, jobId, strangerOrganizationId, strangerJobId, clientId, contractId
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
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Delete comment for job', () => {
    it('should delete a comment for a job', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            JobId: jobId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments/${comment.id}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should not delete a comment for a job that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            JobId: strangerJobId,
            OrganizationId: strangerOrganizationId,
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${strangerJobId}/comments/${comment.id}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should not delete a comment for a job that does not exist', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments/999999`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
