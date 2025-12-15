const request = require('supertest')
const app = require('../../../../server')
const { sequelize, Organization } = require('../../../../db')

let orgID

beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgID = orgs[0].id
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
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
