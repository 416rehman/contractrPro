const request = require('supertest')
const app = require('../../../../../server')
const {
    Comment,
    Organization,
    Client,
    Contract,
    Attachment,
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

describe('Update comment for contract', () => {
    it('should update a comment for a contract', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            ContractId: contractId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .put(
                `/organizations/${orgId}/contracts/${contractId}/comments/${comment.id}`
            )
            .send({ content: 'new content' })
            .expect(200)

        const { status } = response.body

        expect(status).toBe('success')

        // get the updated comment
        const updatedComment = await Comment.findByPk(comment.id)
        expect(updatedComment.content).toBe('new content')
    })

    it('should not update a comment for a contract that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            ContractId: strangerContractId,
            OrganizationId: strangerOrganizationId,
        })

        const response = await request(app)
            .put(
                `/organizations/${orgId}/contracts/${strangerContractId}/comments/${comment.id}`
            )
            .send({ content: 'new content' })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should update a comment for a contract with attachments', async () => {
        const comment = await Comment.create({
            content: 'Original content',
            ContractId: contractId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .put(
                `/organizations/${orgId}/contracts/${contractId}/comments/${comment.id}`
            )
            .field('content', 'new content')
            .attach('Attachments', fileToAttachPath) // Pass a single file path
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
