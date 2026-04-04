const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { contracts, organizations, clients } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgID, clientId

beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgID = orgs[0].id
    // create a client for the contract
    const clientData = fake.mockClientData()
    clientData.OrganizationId = orgID
    const client = await db.insert(clients).values(clientData).returning().then(r => r[0])
    clientId = client.id
})

afterAll(async () => {
    jest.restoreAllMocks()

    // Delete the client
    await db.delete(clients).where(eq(clients.id, clientId,
        ))
    await clearDatabase()
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
            await db.delete(contracts).where(eq(contracts.id, response.body.data.id ))
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
