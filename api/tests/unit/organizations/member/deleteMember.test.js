const request = require('supertest')
const app = require('../../../../src/server')
const {
    OrganizationMember,
    Organization,
    sequelize,
} = require('../../../../db')
const fake = require('../../../../src/utils/fake')

let orgId, memberId
beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgId = orgs[0].id

    const memberToDelete = await OrganizationMember.create({
        ...fake.mockOrgMemberData(),
        OrganizationId: orgId,
    })
    memberId = memberToDelete.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Delete member from organization', () => {
    it('should delete a member from the organization', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/members/${memberId}`)
            .expect(200)

        expect(response.body.status).toBe('success')
    })

    it('should return 403 if Organization ID is invalid', async () => {
        const response = await request(app)
            .delete(`/organizations/bad-id/members/${memberId}`)
            .expect(403)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if Member ID is invalid', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/members/bad-id`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if member is not found', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/members/${memberId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if an error occurs during member deletion', async () => {
        // Mock the destroy method to throw an error
        jest.spyOn(OrganizationMember, 'destroy').mockImplementation(() => {
            throw new Error('Error message from the server')
        })

        const response = await request(app)
            .delete(`/organizations/${orgId}/members/${memberId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
