const request = require('supertest')
const app = require('../../../../server')
const {
    OrganizationMember,
    Organization,
    sequelize,
} = require('../../../../db')

let orgId, memberId
beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgId = orgs[0].id

    const membersResult = await OrganizationMember.findAll({
        where: { OrganizationId: orgId },
    })

    memberId = membersResult[0].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('GET /organizations/:org_id/members/:member_id', () => {
    test('Should return success and member data if the organization ID and member ID are valid', async () => {
        const res = await request(app)
            .get(`/organizations/${orgId}/members/${memberId}`)
            .expect(200)

        expect(res.body).toHaveProperty('status', 'success')
        expect(res.body).toHaveProperty('data')
        expect(res.body.data).toHaveProperty('id', memberId)
        expect(res.body.data).toHaveProperty('name')
        expect(res.body.data).toHaveProperty('email')
        expect(res.body.data).toHaveProperty('phone')
        expect(res.body.data).toHaveProperty('permissions')
        expect(res.body.data).toHaveProperty('createdAt')
        expect(res.body.data).toHaveProperty('updatedAt')
        expect(res.body.data).toHaveProperty('UpdatedByUserId')
        expect(res.body.data).toHaveProperty('OrganizationId', orgId)
        expect(res.body.data).toHaveProperty('UserId')
    })

    test('Should return an error if the organization ID is not a valid UUID', async () => {
        const res = await request(app)
            .get(
                '/organizations/123/members/ee250697-62a6-45c7-bf1e-172dcc67c12d'
            )
            .expect(400)

        expect(res.body).toHaveProperty('status', 'error')
    })

    test('Should return an error if the member ID is not a valid UUID', async () => {
        const res = await request(app)
            .get(`/organizations/${orgId}/members/123`)
            .expect(400)

        expect(res.body).toHaveProperty('status', 'error')
    })

    test('Should handle server errors and return an error response', async () => {
        // Mocking the implementation to simulate a server error
        jest.spyOn(OrganizationMember, 'findOne').mockImplementationOnce(() => {
            throw new Error('Something went wrong')
        })

        const res = await request(app)
            .get(`/organizations/${orgId}/members/${memberId}`)
            .expect(400)

        expect(res.body).toHaveProperty('status', 'error')
        expect(res.body).toHaveProperty('message', 'Something went wrong')
    })
})
