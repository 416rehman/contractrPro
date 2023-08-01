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

describe(`GET /organizations/:org_id/contracts`, () => {
    it(`Should return success if the organization's contracts are found`, async () => {
        const response = await request(app)
            .get(`/organizations/${orgID}/contracts`)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toBeInstanceOf(Array)
        expect(response.body.data[0]).toHaveProperty('id')
        expect(response.body.data[0]).toHaveProperty('name')
        expect(response.body.data[0]).toHaveProperty('description')
        expect(response.body.data[0]).toHaveProperty('startDate')
        expect(response.body.data[0]).toHaveProperty('dueDate')
        expect(response.body.data[0]).toHaveProperty('completionDate')
        expect(response.body.data[0]).toHaveProperty('status')
        expect(response.body.data[0]).toHaveProperty('createdAt')
        expect(response.body.data[0]).toHaveProperty('updatedAt')
        expect(response.body.data[0]).toHaveProperty('UpdatedByUserId')
        expect(response.body.data[0]).toHaveProperty('OrganizationId')
        expect(response.body.data[0]).toHaveProperty('ClientId')
    })

    it(`Should return error for not requiring an organization's ID`, async () => {
        orgID = null

        const res = await request(app)
            .get(`/organizations/${orgID}/contracts`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })

    it(`Should return 403 if organization ID is invalid`, async () => {
        orgID = '550e8400-e29b-41d4-a716-446655430000'

        await request(app).get(`/organizations/${orgID}/contracts`).expect(403)
    })
})
