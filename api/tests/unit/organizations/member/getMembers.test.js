const request = require('supertest')
const app = require('../../../../server')
const {
    OrganizationMember,
    Organization,
    sequelize,
} = require('../../../../db')

let orgId
beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgId = orgs[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('GET /organizations/:org_id/members', () => {
    test('Should return success and member data if the organization ID is valid', async () => {
        const res = await request(app)
            .get(`/organizations/${orgId}/members`)
            .expect(200)

        expect(res.body).toHaveProperty('status', 'success')
        expect(res.body).toHaveProperty('data')
        expect(Array.isArray(res.body.data)).toBeTruthy()
        expect(res.body.data.length).toBeGreaterThan(0)
        expect(res.body.data[0]).toHaveProperty('id')
        expect(res.body.data[0]).toHaveProperty('name')
    })

    test('Should return an error if the organization ID is invalid', async () => {
        const res = await request(app)
            .get('/organizations/123/members')
            .expect(403)

        expect(res.body).toHaveProperty('status', 'error')
    })

    test('Should handle server errors and return an error response', async () => {
        // Mocking the implementation to simulate a server error
        jest.spyOn(OrganizationMember, 'findAll').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const res = await request(app)
            .get(`/organizations/${orgId}/members`)
            .expect(400)

        expect(res.body).toHaveProperty('status', 'error')
    })
})