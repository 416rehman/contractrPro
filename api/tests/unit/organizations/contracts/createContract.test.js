const request = require('supertest')
const app = require('../../../../src/server')
const { sequelize, Contract, Organization, Client } = require('../../../../db')
const fake = require('../../../../src/utils/fake')

let orgID, clientId

beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgID = orgs[0].id
    // create a client for the contract
    const clientData = fake.mockClientData()
    clientData.OrganizationId = orgID
    const client = await Client.create(clientData)
    clientId = client.id
})

afterAll(async () => {
    jest.restoreAllMocks()

    // Delete the client
    await Client.destroy({
        where: {
            id: clientId,
        },
    })
    await sequelize.close()
})

describe(`POST /organizations/:org_id/contracts`, () => {
    it(`Should return success for creating a contract for an existing organization`, async () => {
        const contractData = fake.mockContractData()
        contractData.ClientId = clientId

        const response = await request(app)
            .post(`/organizations/${orgID}/contracts`)
            .send(contractData)
            .expect(201)

        expect(response.body.status).toBe('success')
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('name', contractData.name)
        expect(response.body.data).toHaveProperty(
            'description',
            contractData.description
        )
        expect(response.body.data).toHaveProperty(
            'startDate',
            contractData.startDate.toISOString()
        )
        expect(response.body.data).toHaveProperty(
            'dueDate',
            contractData.dueDate.toISOString()
        )
        expect(response.body.data).toHaveProperty(
            'completionDate',
            contractData.completionDate.toISOString()
        )
        expect(response.body.data).toHaveProperty('status', contractData.status)
        expect(response.body.data).toHaveProperty('OrganizationId', orgID)
        expect(response.body.data).toHaveProperty('ClientId')
        expect(response.body.data).toHaveProperty('updatedAt')
        expect(response.body.data).toHaveProperty('createdAt')

        // Cleanup - Deletes the contract
        if (response?.body?.data?.id) {
            await Contract.destroy({
                where: { id: response.body.data.id },
            })
        }
    })

    it(`Should return error for creating a contract without requiring the organization's ID`, async () => {
        const contractData = fake.mockContractData()
        contractData.ClientId = clientId

        orgID = null

        const res = await request(app)
            .post(`/organizations/${orgID}/contracts`)
            .send(contractData)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })

    it(`Should return error for creating a contract for an organization that doesn't exist`, async () => {
        const contractData = fake.mockContractData()
        contractData.ClientId = clientId

        orgID = '550e8400-e29b-41d4-a716-446655430000'

        const response = await request(app)
            .post(`/organizations/${orgID}/contracts`)
            .send(contractData)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(response.body.status).toBe('error')
    })

    it(`Should return error for creating a contract without a client's ID`, async () => {
        const contractData = fake.mockContractData()

        const response = await request(app)
            .post(`/organizations/${orgID}/contracts`)
            .send(contractData)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(response.body.status).toBe('error')
    })
})
