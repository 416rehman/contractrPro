const request = require('supertest')
const app = require('../../../../server')
const { OrganizationMember } = require('../../../../db')

let orgsResult, orgId
beforeAll(async () => {
    // get first org Id from /admin/organizations
    orgsResult = await request(app).get('/admin/organizations').expect(200)
    orgId = orgsResult.body.data.organizations[0].id
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

    test('Should return an error if the organization ID is not a UUID', async () => {
        const res = await request(app)
            .get('/organizations/123/members')
            .expect(400)

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
        expect(res.body).toHaveProperty('message', 'Something went wrong')
    })
})
