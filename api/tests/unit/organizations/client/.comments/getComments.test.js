const request = require('supertest')
const app = require('../../../../../src/server')
const {
    Comment,
    Organization,
    Client,
    sequelize,
} = require('../../../../../db')
const fake = require('../../../../../src/utils/fake')

let orgId, clientId, comment
beforeAll(async () => {
    const org = await Organization.findAll({ limit: 1 })
    orgId = org[0].id

    const client = await Client.create({
        ...fake.mockClientData(),
        OrganizationId: orgId,
    })
    clientId = client.id

    comment = await Comment.create({
        ...fake.mockCommentData(),
        OrganizationId: orgId,
        ClientId: clientId,
        AuthorId: process.env.DEV_USER_UUID,
    })
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Get comments for client', () => {
    it('should get comments for a client', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/clients/${clientId}/comments`)
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
            .get(`/organizations/${invalidOrgId}/clients/${clientId}/comments`)
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if client ID is invalid', async () => {
        const invalidClientId = 'invalid-client-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/clients/${invalidClientId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if client does not belong to organization', async () => {
        const clientId = 'non-existing-client-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/clients/${clientId}/comments`)
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
            .get(`/organizations/${orgId}/clients/${clientId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
