const request = require('supertest')
const app = require('../../../../server')
const { Organization, Client, sequelize } = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgId, clientId, strangerClientId

beforeAll(async () => {
    const orgResuts = await Organization.findAll()
    orgId = orgResuts[0].id

    const clientToDelete = await Client.create({
        ...fake.mockClientData(),
        OrganizationId: orgId,
    })
    clientId = clientToDelete.id

    const strangerClient = await Client.create({
        ...fake.mockClientData(),
        OrganizationId: orgResuts[1].id,
    })
    strangerClientId = strangerClient.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Delete organization client', () => {
    it('should delete an organization client', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/clients/${clientId}`)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toBe(1)
    })

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .delete(`/organizations/${invalidOrgId}/clients/${clientId}`)
            .expect(403)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if client ID is invalid', async () => {
        const invalidClientId = 'invalid-client-id'

        const response = await request(app)
            .delete(`/organizations/${orgId}/clients/${invalidClientId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if client is not found', async () => {
        jest.spyOn(Client, 'destroy').mockImplementationOnce(() => 0)

        const response = await request(app)
            .delete(`/organizations/${orgId}/clients/${clientId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if the client is not in the organization', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/clients/${strangerClientId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        jest.spyOn(sequelize, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .delete(`/organizations/${orgId}/clients/${clientId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
