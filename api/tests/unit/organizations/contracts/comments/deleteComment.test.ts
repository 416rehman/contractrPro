const request = require('supertest')
const app = require('../../../../../server')
const {
    Comment,
    Organization,
    Client,
    Contract,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../utils/fake')

let orgId, contractId, strangerOrganizationId, strangerContractId, clientId
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
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Delete comment for contract', () => {
    it('should delete a comment for a contract', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            ContractId: contractId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${contractId}/comments/${comment.id}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should not delete a comment for a contract that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            ContractId: strangerContractId,
            OrganizationId: strangerOrganizationId,
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${strangerContractId}/comments/${comment.id}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should not delete a comment for a contract that does not exist', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${contractId}/comments/999999`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
