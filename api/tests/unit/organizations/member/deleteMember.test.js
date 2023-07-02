const request = require('supertest')
const app = require('../../../../server')
const { OrganizationMember } = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgId
beforeAll(async () => {
    // Get organization ID from /admin/organizations
    const orgsResult = await request(app)
        .get('/admin/organizations')
        .expect(200)
    orgId = orgsResult.body.data.organizations[0].id
})

describe('Delete member from organization', () => {
    it('should delete a member from the organization', async () => {
        // create a new member
        const newMember = await OrganizationMember.build({
            ...fake.mockOrgMemberData(),
            OrganizationId: orgId,
        }).save()

        const response = await request(app)
            .delete(`/organizations/${orgId}/members/${newMember.id}`)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveProperty('id', newMember.id)
        expect(response.body.data).toHaveProperty('name')
        expect(response.body.data).toHaveProperty('email')
        expect(response.body.data).toHaveProperty('phone')
        expect(response.body.data).toHaveProperty('OrganizationId', orgId)
    })

    it('should return 400 if Organization ID is invalid', async () => {
        const memberId = '40238b08-843a-4a7e-a035-4f14734abb36'

        const response = await request(app)
            .delete(`/organizations/bad-id/members/${memberId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
        expect(response.body.error).toBe('Organization ID is required')
    })

    it('should return 400 if Member ID is invalid', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgId}/members/bad-id`)
            .expect(400)

        expect(response.body.status).toBe('error')
        expect(response.body.error).toBe('Member ID is required')
    })

    it('should return 400 if member is not found', async () => {
        const memberId = fake.faker.string.uuid()

        const response = await request(app)
            .delete(`/organizations/${orgId}/members/${memberId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
        // Check the specific error message returned by the server
        expect(response.body.error).toBe('Member not found')
    })

    it('should return 400 if an error occurs during member deletion', async () => {
        // Mock the destroy method to throw an error
        jest.spyOn(OrganizationMember, 'findOne').mockImplementation(() => {
            throw new Error('Error message from the server')
        })
        const memberId = fake.faker.string.uuid()
        const response = await request(app)
            .delete(`/organizations/${orgId}/members/${memberId}`)
            .expect(400)

        expect(response.body.status).toBe('error')
        // Check the specific error message returned by the server
        expect(response.body.error).toBe('Error message from the server')
    })
})
