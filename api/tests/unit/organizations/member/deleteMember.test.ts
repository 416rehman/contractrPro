const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { OrganizationMember, organizations } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgId, memberId
beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgId = orgs[0].id

    const memberToDelete = await Organizationdb.insert(organizationMembers).values({
        ...fake.mockOrgMemberData().returning().then(r => r[0]),
        organizationId: orgId,
    })
    memberId = memberToDelete.id
})
afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
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
