const request = require('supertest')
const app = require('../../../../server')
const db = require('../../../../db')
import { db } from '../../../../db/index'
import { organizations, OrganizationMember } from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../utils/testDB'

import * as fake from '../../../../utils/fake'

let orgId, orgMemberData
beforeAll(async () => {
    const orgs = await db.select().from(organizations)
    orgId = orgs[0].id

    const membersResult = await OrganizationMember.findAll({
        where: { OrganizationId: orgId },
    })

    orgMemberData = membersResult[0].dataValues
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})

describe('Update organization member', () => {
    it('should update an organization member', async () => {
        const updatedMemberData = fake.mockOrgMemberData()
        const response = await request(app)
            .put(`/organizations/${orgId}/members/${orgMemberData.id}`)
            .send(updatedMemberData)
            .expect(200)

        expect(response.body.status).toBe('success')
        // expect the response to have the updated data
        expect(response.body.data).toHaveProperty(
            'name',
            updatedMemberData.name
        )
        expect(response.body.data).toHaveProperty(
            'email',
            updatedMemberData.email
        )
        expect(response.body.data).toHaveProperty(
            'phone',
            updatedMemberData.phone
        )
    })

    it('should return 400 if Organization ID is missing', async () => {
        await request(app)
            .put(`/organizations//members/${orgMemberData.id}`)
            .send(fake.mockOrgMemberData())
            .expect(404)
    })

    it('should return 400 if Member ID is missing', async () => {
        await request(app)
            .put(`/organizations/${orgId}/members/`)
            .send(fake.mockOrgMemberData())
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
            .send(fake.mockOrgMemberData())
            .expect(400)

        expect(response.body.status).toBe('error')
    })
})
