const request = require('supertest')
const _app = require('../../../../server'); const app = _app.default || _app;
import { db } from '../../../../db/index'
import { Invite, organizations } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgID, inviteID

beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgID = orgs[0].id

    const inviteToDelete = await db.insert(invites).values({
        ...fake.mockInviteData(),
        organizationId: orgID,
    }).returning().then(r => r[0])
    inviteID = inviteToDelete.id
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})

describe('Delete organization invite', () => {
    it('should delete an invite from the organization', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgID}/invites/${inviteID}`)
            .expect(200)

        expect(response.body.status).toBe('success')
    })

    it('should return 403 if Organization ID is invalid', async () => {
        const response = await request(app)
            .delete(`/organizations/bad-id/invites/${inviteID}`)
            .expect(403)

        expect(response.body.status).toBe('error')
    })

    it('should return 400 if Invite ID is invalid', async () => {
        const response = await request(app)
            .delete(`/organizations/${orgID}/invites/bad-id`)
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
