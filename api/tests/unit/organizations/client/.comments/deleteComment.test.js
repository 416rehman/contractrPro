const request = require('supertest')
const app = require('../../../../../src/server')
const {
    Comment,
    Organization,
    Client,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../src/utils/fake')

let orgId, clientId, strangerOrganizationId, strangerClientId
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
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Delete comment for client', () => {
    it('should delete a comment for a client', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            ClientId: clientId,
            OrganizationId: orgId,
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/clients/${clientId}/comments/${comment.id}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should not delete a comment for a client that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await Comment.create({
            ...commentData,
            ClientId: strangerClientId,
            OrganizationId: strangerOrganizationId,
        })

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/clients/${strangerClientId}/comments/${comment.id}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should not delete a comment for a client that does not exist', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/clients/${clientId}/comments/999999`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
