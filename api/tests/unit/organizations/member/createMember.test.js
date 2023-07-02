const request = require('supertest')
const app = require('../../../../server')
const { OrganizationMember } = require('../../../../db')

let orgId, userId
let orgMemberInfo = {
    name: 'I am a member :(',
    email: 'member@org.ca',
    phone: '1234567890',
    permissions: 1,
}
beforeAll(async () => {
    // Get organization ID from /admin/organizations
    const orgsResult = await request(app)
        .get('/admin/organizations')
        .expect(200)
    orgId = orgsResult.body.data.organizations[0].id
    // Get existing user ID from /organizations/:org_id/members
    const membersResult = await request(app).get(`/admin/users`).expect(200)
    userId = membersResult.body.data.users[1].id
})

describe('Create organization member', () => {
    it('should create a member in an organization with no user', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/members`)
            .send(orgMemberInfo)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('name', orgMemberInfo.name)
        expect(response.body.data).toHaveProperty('email', orgMemberInfo.email)
        expect(response.body.data).toHaveProperty('phone', orgMemberInfo.phone)
        expect(response.body.data).toHaveProperty(
            'permissions',
            orgMemberInfo.permissions
        )
        expect(response.body.data).toHaveProperty('OrganizationId', orgId)
        expect(response.body.data).toHaveProperty('UserId', null)

        // cleanup - delete the member
        if (response?.body?.data?.id)
            await OrganizationMember.destroy({
                where: { id: response.body.data.id },
            })
    })

    it('should fail if a member with same email or phone already exists', async () => {
        // Create first member
        request(app)
            .post(`/organizations/${orgId}/members`)
            .send(orgMemberInfo)
            .then(async (response0) => {
                // Create second member with same email and phone
                const response = await request(app)
                    .post(`/organizations/${orgId}/members`)
                    .send(orgMemberInfo)
                    .expect(400)

                expect(response.body.status).toBe('error')
                // cleanup - delete the member
                if (response?.body?.data?.id)
                    await OrganizationMember.destroy({
                        where: { id: response.body.data.id },
                    })
                if (response0?.body?.data?.id)
                    await OrganizationMember.destroy({
                        where: { id: response0.body.data.id },
                    })
            })
    })

    it('should return 404 if Organization ID is missing', async () => {
        const response = await request(app)
            .post('/organizations//members')
            .send(orgMemberInfo)
            .expect(404)
        // cleanup - delete the member
        if (response?.body?.data?.id)
            await OrganizationMember.destroy({
                where: { id: response.body.data.id },
            })
    })

    it('should return 400 if UserId is provided and user does not exist', async () => {
        orgMemberInfo.UserId = 'non-existent-user-id'

        const response = await request(app)
            .post(`/organizations/${orgId}/members`)
            .send(orgMemberInfo)
            .expect(400)

        expect(response.body.status).toBe('error')
        expect(response.body).toHaveProperty('error')
    })

    it('should return 400 if UserId is provided and user is already a member of the organization', async () => {
        orgMemberInfo.UserId = userId

        // Create a member with the same user ID
        request(app)
            .post(`/organizations/${orgId}/members`)
            .send(orgMemberInfo)
            .end(async (response0) => {
                const response = await request(app)
                    .post(`/organizations/${orgId}/members`)
                    .send(orgMemberInfo)
                    .expect(400)

                expect(response.body.status).toBe('error')
                expect(response.body).toHaveProperty('error')

                // cleanup - delete the member
                if (response?.body?.data?.id)
                    await OrganizationMember.destroy({
                        where: { id: response.body.data.id },
                    })
                if (response0?.body?.data?.id)
                    await OrganizationMember.destroy({
                        where: { id: response0.body.data.id },
                    })
            })
    })

    it('should return 400 if an error occurs during member creation', async () => {
        // Mocking the implementation to simulate a server error
        jest.spyOn(OrganizationMember, 'build').mockImplementation(() => {
            throw new Error('Error message from the server')
        })

        const response = await request(app)
            .post(`/organizations/${orgId}/members`)
            .send(orgMemberInfo)
            .expect(400)

        expect(response.body.status).toBe('error')
        expect(response.body).toHaveProperty(
            'error',
            'Error message from the server'
        )
    })
})
