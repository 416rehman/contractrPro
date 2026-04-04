const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { Invite, organizations } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

const { Op } = require('sequelize')

let orgID, invite, emptyOrgID, emptyInviteID, strangerInvite

beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgID = orgs[0].id

    invite = (await db.select().from(invites).limit(1))[0]

    strangerInvite = (await db.select().from(invites).limit(1))[0]
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})

describe(`GET /organizations/:org_id/invites/:invite_id`, () => {
    test(`Should return success if the organization's invite is found`, async () => {
        const response = await request(app)
            .get(`/organizations/${orgID}/invites/${invite.id}`)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).not.toBeInstanceOf(Array)
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('uses')
        expect(response.body.data).toHaveProperty('maxUses')
        expect(response.body.data).toHaveProperty('OrganizationId')
        expect(response.body.data).toHaveProperty('ForOrganizationMemberId')
        expect(response.body.data).toHaveProperty('updatedAt')
        expect(response.body.data).toHaveProperty('createdAt')
        expect(response.body.data).toHaveProperty('UpdatedByUserId')
    })

    test(`Should return error for not requiring an organization ID`, async () => {
        emptyOrgID = null

        const res = await request(app)
            .get(`/organizations/${emptyOrgID}/invites/${invite.id}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })

    test(`Should return error for not requiring an organization's invite's ID`, async () => {
        emptyInviteID = null

        const res = await request(app)
            .get(`/organizations/${orgID}/invites/${emptyInviteID}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })

    test(`Should return error for trying to find an invite from an organization that doesn't exist`, async () => {
        orgID = '550e8400-e29b-41d4-a716-446655430000'

        const res = await request(app)
            .get(`/organizations/${orgID}/invites/${invite.id}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })

    test(`Should return error for finding an organization's invite that doesn't exist`, async () => {
        const res = await request(app)
            .get(`/organizations/${orgID}/invites/${strangerInvite.id}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })
})
