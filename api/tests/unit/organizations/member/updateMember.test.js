const request = require('supertest')
const app = require('../../../../server')
const db = require('../../../../db')

let orgId, orgMemberData
beforeAll(async () => {
    // Get organization ID from /admin/organizations
    const orgsResult = await request(app)
        .get('/admin/organizations')
        .expect(200)
    orgId = orgsResult.body.data.organizations[0].id

    // Get member ID from /organizations/:org_id/members
    const membersResult = await request(app)
        .get(`/organizations/${orgId}/members`)
        .expect(200)
    orgMemberData = membersResult.body.data[0]
})

describe('Update organization member', () => {
    it('should update an organization member', async () => {
        const response = await request(app)
            .put(`/organizations/${orgId}/members/${orgMemberData.id}`)
            .send({
                name: orgMemberData.name + '0',
                email: orgMemberData.email + '0',
                phone: orgMemberData.phone + '0',
            })
            .expect(200)

        expect(response.body.status).toBe('success')
        // expect the response to have the updated data
        expect(response.body.data).toHaveProperty(
            'name',
            orgMemberData.name + '0'
        )
        expect(response.body.data).toHaveProperty(
            'email',
            orgMemberData.email + '0'
        )
        expect(response.body.data).toHaveProperty(
            'phone',
            orgMemberData.phone + '0'
        )
    })

    it('should return 400 if Organization ID is missing', async () => {
        await request(app)
            .put(`/organizations//members/${orgMemberData.id}`)
            .send({
                name: orgMemberData.name + '0',
                email: orgMemberData.email + '0',
                phone: orgMemberData.phone + '0',
            })
            .expect(404)
    })

    it('should return 400 if Member ID is missing', async () => {
        await request(app)
            .put(`/organizations/${orgId}/members/`)
            .send({
                name: orgMemberData.name + '0',
                email: orgMemberData.email + '0',
                phone: orgMemberData.phone + '0',
            })
            .expect(404)
    })

    it('should return 400 if an error occurs during update', async () => {
        // Mocking the implementation to simulate a server error
        jest.spyOn(db.OrganizationMember, 'update').mockImplementationOnce(
            () => {
                throw new Error('Something went wrong')
            }
        )

        const response = await request(app)
            .put(`/organizations/${orgId}/members/${orgMemberData.id}`)
            .send({
                name: orgMemberData.name + '0',
                email: orgMemberData.email + '0',
                phone: orgMemberData.phone + '0',
            })
            .expect(400)

        expect(response.body.status).toBe('error')
        expect(response.body.message).toBe('Something went wrong')
    })
})
