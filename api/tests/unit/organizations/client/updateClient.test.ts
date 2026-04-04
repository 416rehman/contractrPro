const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { clients, organizations } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgId, client
beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgId = orgs[0].id

    client = (await db.select().from(clients).limit(1))[0]
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Update organization client', () => {
    it('should update an organization client', async () => {
        const clientId = client.id
        const updatedClientData = fake.mockClientData()

        const response = await request(app)
            .put(`/organizations/${orgId}/clients/${clientId}`)
            .send(updatedClientData)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveProperty('id', clientId)
        expect(response.body.data).toHaveProperty(
            'name',
            updatedClientData.name
        )
        expect(response.body.data).toHaveProperty(
            'phone',
            updatedClientData.phone
        )
        expect(response.body.data).toHaveProperty(
            'email',
            updatedClientData.email
        )
        expect(response.body.data).toHaveProperty(
            'website',
            updatedClientData.website
        )
        expect(response.body.data).toHaveProperty(
            'description',
            updatedClientData.description
        )
        expect(response.body.data).toHaveProperty('createdAt')
        expect(response.body.data).toHaveProperty('updatedAt')
        expect(response.body.data).toHaveProperty('UpdatedByUserId')
        expect(response.body.data).toHaveProperty('OrganizationId', orgId)
    })

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'
        const clientId = client.id
        const updatedClientData = fake.mockClientData()

        const response = await request(app)
            .put(`/organizations/${invalidOrgId}/clients/${clientId}`)
            .send(updatedClientData)
            .expect(403)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if client ID is invalid', async () => {
        const invalidClientId = 'invalid-client-id'
        const updatedClientData = fake.mockClientData()

        const response = await request(app)
            .put(`/organizations/${orgId}/clients/${invalidClientId}`)
            .send(updatedClientData)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if an exception occurs', async () => {
        const clientId = client.id
        const updatedClientData = fake.mockClientData()

        jest.spyOn(db, 'transaction').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .put(`/organizations/${orgId}/clients/${clientId}`)
            .send(updatedClientData)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
