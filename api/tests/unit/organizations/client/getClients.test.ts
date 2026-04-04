const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { clients, organizations } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'


let orgId
beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgId = orgs[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})
describe('Get organization clients', () => {
    it('should return organization clients', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/clients`)
            .expect(200)

        expect(response.body.status).toBe('success')

        const client = response.body.data[0]
        expect(client).toHaveProperty('id')
        expect(client).toHaveProperty('name')
        expect(client).toHaveProperty('phone')
        expect(client).toHaveProperty('email')
        expect(client).toHaveProperty('website')
        expect(client).toHaveProperty('description')
        expect(client).toHaveProperty('createdAt')
        expect(client).toHaveProperty('updatedAt')
        expect(client).toHaveProperty('UpdatedByUserId')
        expect(client).toHaveProperty('OrganizationId')
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
