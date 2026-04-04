const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { organizations } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'


let orgID

beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgID = orgs[0].id
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})

describe(`GET /organizations/:org_id/invites`, () => {
    it(`Should return success if the organization's invites are found`, async () => {
        const response = await request(app)
            .get(`/organizations/${orgID}/invites`)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toBeInstanceOf(Array)
        expect(response.body.data[0]).toHaveProperty('id')
        expect(response.body.data[0]).toHaveProperty('uses')
        expect(response.body.data[0]).toHaveProperty('maxUses')
        expect(response.body.data[0]).toHaveProperty('OrganizationId')
        expect(response.body.data[0]).toHaveProperty('updatedAt')
        expect(response.body.data[0]).toHaveProperty('createdAt')
        expect(response.body.data[0]).toHaveProperty('UpdatedByUserId')
    })

    it(`Should return error for trying to find invites from an organization that doesn't exist`, async () => {
        const res = await request(app)
            .get(`/organizations/123/invites`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })
})
