const request = require('supertest')
const app = require('../../../../server')
const { sequelize, Invite, Organization } = require('../../../../db')
const fake = require('../../../../utils/fake')

let orgID, inviteID

beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgID = orgs[0].id

    const inviteToDelete = await Invite.create({
        ...fake.mockInviteData(),
        OrganizationId: orgID,
    })
    inviteID = inviteToDelete.id
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe('Delete organization invite', () => {
    it('should delete an invite from the organization', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgID}/invites/${inviteID}`)
            .expect(200)

        expect(response.body.status).toBe('success')
    })

    it('should return 400 if Organization ID is invalid', async () => {
        const response = await request(app)
            .delete(`/organizations/bad-id/invites/${inviteID}`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if Invite ID is invalid', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgID}/invites/bad-id`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
