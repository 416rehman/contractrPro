const request = require('supertest')
const app = require('../../../../src/server')
const { Client, Organization, sequelize } = require('../../../../db')
const { Op } = require('sequelize')

let orgId, client, strangerClient
beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgId = orgs[0].id

    client = await Client.findOne({
        where: { OrganizationId: orgId },
    })

    strangerClient = await Client.findOne({
        where: { OrganizationId: { [Op.ne]: orgId } },
    })
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Get organization clients', () => {
    it('should return an organization client', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/clients/${client.id}`)
            .expect(200)

        expect(response.body.status).toBe('success')

        const body = response.body.data
        expect(body).toHaveProperty('id')
        expect(body).toHaveProperty('name')
        expect(body).toHaveProperty('phone')
        expect(body).toHaveProperty('email')
        expect(body).toHaveProperty('website')
        expect(body).toHaveProperty('description')
        expect(body).toHaveProperty('createdAt')
        expect(body).toHaveProperty('updatedAt')
        expect(body).toHaveProperty('UpdatedByUserId')
        expect(body).toHaveProperty('OrganizationId')
    })

    it('should return an error if a bad client ID is provided', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/clients/123`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 403 if the organization ID is invalid', async () => {
        const response = await request(app)
            .get(`/organizations/123/clients/${client.id}`)
            .expect(403)

        expect(response.body.status).toBe('error')
    })

    it('should return an error if the client does not belong to the organization', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/clients/${strangerClient.id}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return an error if an exception occurs', async () => {
        jest.spyOn(Client, 'findAll').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/clients`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
