const request = require('supertest')
const app = require('../../../../server')
const {
    OrganizationMember,
    Organization,
    User,
    sequelize,
} = require('../../../../db')
const fake = require('../../../../utils/fake')
const { randomInt } = require('crypto')

let orgId, userId
beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgId = orgs[0].id

    // Get an existing user ID
    const membersResult = await User.findAll()
    userId = membersResult[randomInt(0, membersResult.length - 1)].id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})
describe('Create organization member', () => {
    it('should create a member in an organization with no user', async () => {
        const orgMemberInfo = fake.mockOrgMemberData()

        const response = await request(app)
            .post(`/organizations/${orgId}/members`)
            .send(orgMemberInfo)

        expect(response.status).toBe(201)
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
        if (response?.body?.data?.id) {
            await OrganizationMember.destroy({
                where: { id: response.body.data.id },
            })
        }
    })

    it('should fail if a member with same email or phone already exists', async () => {
        const orgMemberInfo = fake.mockOrgMemberData()

        // Create first member
        const initMember = await OrganizationMember.create({
            ...orgMemberInfo,
            OrganizationId: orgId,
        })

        // Create second member with same email and phone
        const response = await request(app)
            .post(`/organizations/${orgId}/members`)
            .send(orgMemberInfo)

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('error')

        // cleanup - delete the member
        if (response?.body?.data?.id) {
            await OrganizationMember.destroy({
                where: { id: response.body.data.id },
            })
        }
        if (initMember?.id) {
            await OrganizationMember.destroy({
                where: { id: initMember.id },
            })
        }
    })

    it('should return 404 if Organization ID is missing', async () => {
        const orgMemberInfo = fake.mockOrgMemberData()

        const response = await request(app)
            .post('/organizations//members')
            .send(orgMemberInfo)

        expect(response.status).toBe(404)

        // cleanup - delete the member
        if (response?.body?.data?.id)
            await OrganizationMember.destroy({
                where: { id: response.body.data.id },
            })
    })

    it('should return 400 if UserId is provided and user does not exist', async () => {
        const orgMemberInfo = fake.mockOrgMemberData()
        orgMemberInfo.UserId = 'non-existent-user-id'

        const response = await request(app)
            .post(`/organizations/${orgId}/members`)
            .send(orgMemberInfo)

        expect(response.status).toBe(400)

        expect(response.body.status).toBe('error')

        // cleanup - delete the member
        if (response?.body?.data?.id)
            await OrganizationMember.destroy({
                where: { id: response.body.data.id },
            })
    })

    it('should return 400 if UserId is provided and user is already a member of the organization', async () => {
        const orgMemberInfo = fake.mockOrgMemberData()
        orgMemberInfo.UserId = userId
        let initMember
        try {
            // Create a member with the same user ID
            initMember = await OrganizationMember.create({
                ...orgMemberInfo,
                OrganizationId: orgId,
            })
        } catch (error) {
            console.log(error)
        }

        const response = await request(app)
            .post(`/organizations/${orgId}/members`)
            .send(orgMemberInfo)

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('error')
        expect(response.body).toHaveProperty('message')

        // cleanup - delete the member
        if (response?.body?.data?.id) {
            await OrganizationMember.destroy({
                where: { id: response.body.data.id },
            })
        }
        if (initMember?.id) {
            await OrganizationMember.destroy({
                where: { id: initMember.id },
            })
        }
    })

    it('should return 400 if an error occurs during member creation', async () => {
        const orgMemberInfo = fake.mockOrgMemberData()

        // Mocking the implementation to simulate a server error
        jest.spyOn(OrganizationMember, 'create').mockImplementation(() => {
            throw new Error('Error message from the server')
        })

        const response = await request(app)
            .post(`/organizations/${orgId}/members`)
            .send(orgMemberInfo)

        expect(response.status).toBe(400)
        expect(response.body.status).toBe('error')
    })
})