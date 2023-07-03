const request = require('supertest')
const app = require('../../../../server')
const { sequelize, Invite, Organization } = require('../../../../db')
const { Op } = require('sequelize')

let orgID, invite, emptyOrgID, emptyInviteID, strangerInvite

beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgID = orgs[0].id

    invite = await Invite.findOne({
        where: { OrganizationId: orgID },
    })

    strangerInvite = await Invite.findOne({
        where: { OrganizationId: { [Op.ne]: orgID } },
    })
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe(`GET /organizations/:org_id/invites/:invite_id`, () => {
    test(`Should return success if the organization's invite is found`, async () => {
        const response = await request(app)
            .get(`/organizations/${orgID}/invites/${invite.id}`)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).not.toBeInstanceOf(Array)
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('code')
        expect(response.body.data).toHaveProperty('uses')
        expect(response.body.data).toHaveProperty('maxUses')
        expect(response.body.data).toHaveProperty('OrganizationId')
        expect(response.body.data).toHaveProperty('updatedAt')
        expect(response.body.data).toHaveProperty('createdAt')
        expect(response.body.data).toHaveProperty('created_by')
        expect(response.body.data).toHaveProperty('UpdatedByUserId')
        expect(response.body.data).toHaveProperty('OrganizationId')
    })

    test(`Should return error for not requiring an organization ID`, async () => {
        emptyOrgID = null

        const res = await request(app)
            .get(`/organizations/${emptyOrgID}/invites/${invite.id}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
        expect(res.body.message).toBe('Organization ID required')
    })

    test(`Should return error for not requiring an organization's invite's ID`, async () => {
        emptyInviteID = null

        const res = await request(app)
            .get(`/organizations/${orgID}/invites/${emptyInviteID}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
        expect(res.body.message).toBe('Invite ID required')
    })

    test(`Should return error for trying to find an invite from an organization that doesn't exist`, async () => {
        orgID = '550e8400-e29b-41d4-a716-446655430000'

        const res = await request(app)
            .get(`/organizations/${orgID}/invites/${invite.id}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
        expect(res.body.message).toBe('Not found')
    })

    test(`Should return error for finding an organization's invite that doesn't exist`, async () => {
        const res = await request(app)
            .get(`/organizations/${orgID}/invites/${strangerInvite.id}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
        expect(res.body.message).toBe('Not found')
    })
})
