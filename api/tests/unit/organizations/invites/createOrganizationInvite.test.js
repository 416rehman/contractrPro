const request = require('supertest')
const app = require('../../../../server')
const { sequelize, Invite, Organization } = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgID

beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgID = orgs[0].id
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe(`POST /organizations/:org_id/invites`, () => {
    it(`Should return success for creating an invite for an existing organization`, async () => {
        const inviteData = fake.mockInviteData()

        const response = await request(app)
            .post(`/organizations/${orgID}/invites`)
            .send(inviteData)
            .expect(201)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('code', inviteData.code)
        expect(response.body.data).toHaveProperty('uses', inviteData.uses)
        expect(response.body.data).toHaveProperty('maxUses', inviteData.maxUses)
        expect(response.body.data).toHaveProperty('OrganizationId', orgID)
        expect(response.body.data).toHaveProperty('updatedAt')
        expect(response.body.data).toHaveProperty('createdAt')
        expect(response.body.data).toHaveProperty('created_by')

        // Cleanup - Deletes the Invite
        if (response?.body?.data?.id) {
            await Invite.destroy({
                where: { id: response.body.data.id },
            })
        }
    })

    it(`Should return error for creating a contract without requiring the organization's ID`, async () => {
        const inviteData = fake.mockInviteData()

        orgID = null

        const response = await request(app)
            .post(`/organizations/${orgID}/invites`)
            .send(inviteData)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(response.body.status).toBe('error')
    })

    it(`Should return error for creating a contract for an organization that doesn't exist`, async () => {
        const inviteData = fake.mockContractData()

        orgID = '550e8400-e29b-41d4-a716-446655430000'

        const response = await request(app)
            .post(`/organizations/${orgID}/invites`)
            .send(inviteData)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(response.body.status).toBe('error')
    })
})
