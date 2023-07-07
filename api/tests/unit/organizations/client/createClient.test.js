const request = require('supertest')
const app = require('../../../../server')
const { Client, Organization, sequelize } = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgId
beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgId = orgs[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Add member to organization', () => {
    it('should add a client to an organization', async () => {
        const clientData = fake.mockClientData()

        const response = await request(app)
            .post(`/organizations/${orgId}/clients`)
            .send(clientData)
            .expect(201)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('name', clientData.name)
        expect(response.body.data).toHaveProperty('email', clientData.email)
        expect(response.body.data).toHaveProperty('phone', clientData.phone)
        expect(response.body.data).toHaveProperty('website', clientData.website)
        expect(response.body.data).toHaveProperty(
            'description',
            clientData.description
        )
        expect(response.body.data).toHaveProperty('OrganizationId', orgId)
        expect(response.body.data).toHaveProperty('UpdatedByUserId')
        expect(response.body.data).toHaveProperty('updatedAt')
        expect(response.body.data).toHaveProperty('createdAt')

        // cleanup - delete the member
        if (response?.body?.data?.id) {
            await Client.destroy({
                where: { id: response.body.data.id },
            })
        }
    })

    it('should return 400 if a client with same email or phone already exists', async () => {
        const clientData = fake.mockClientData()

        // Create first member
        const initClient = await Client.create({
            ...clientData,
            OrganizationId: orgId,
        })

        // Create second member with same email and phone
        const response = await request(app)
            .post(`/organizations/${orgId}/clients`)
            .send(clientData)
            .expect(400)

        expect(response.body.status).toBe('error')
        expect(response.body.message).toBeDefined()

        // cleanup - delete the member
        if (initClient?.id) {
            await Client.destroy({
                where: { id: initClient.id },
            })
        }
    })

    it('should return 400 if an error occurs during saving', async () => {
        jest.spyOn(Client, 'create').mockImplementation(() => {
            throw new Error('Something went wrong')
        })

        const clientData = fake.mockClientData()

        const response = await request(app)
            .post(`/organizations/${orgId}/clients`)
            .send(clientData)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
