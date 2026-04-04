const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { organizations, clients } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'
const fs = require('fs')

let orgId, clientId, strangerOrganizationId, strangerClientId
let fileToAttachPath, fileContent, fileToAttachName
beforeAll(async () => {
    const org = await db.select().from(organizations)
    orgId = org[0].id
    const [strangerOrg] = await db.insert(organizations).values(fake.mockOrganizationData()).returning();
    strangerOrganizationId = strangerOrg.id

    const [client] = await db.insert(clients).values({ ...fake.mockClientData(), organizationId: orgId, }).returning()
    clientId = client.id

    const [strangerClient] = await db.insert(clients).values({ ...fake.mockClientData(), organizationId: strangerOrganizationId, }).returning()
    strangerClientId = strangerClient.id

    // create a file and get its absolute path
    fileContent = 'test'
    fileToAttachName = 'test.txt'
    fs.writeFileSync(`./${fileToAttachName}`, fileContent)
    fileToAttachPath = fs.realpathSync(`./${fileToAttachName}`)
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})

describe('Create comment for client', () => {
    it('should create a comment for a client with no attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
            .send(commentData)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe(commentData.content)
    })

    it('should create a comment for a client with attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
            .field('content', commentData.content)
            .attach('Attachments', fileToAttachPath)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe(commentData.content)
        expect(data.attachments).toBeDefined()
        expect(Array.isArray(data.attachments)).toBe(true)
        expect(data.attachments.length).toBe(1)
        expect(data.attachments[0].name).toBe(fileToAttachName)
    })

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .post(`/organizations/${invalidOrgId}/clients/${clientId}/comments`)
            .send(fake.mockCommentData())
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if client ID is invalid', async () => {
        const invalidClientId = 'invalid-client-id'

        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${invalidClientId}/comments`)
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is missing', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is empty and no attachments', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
            .field('content', '')
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should create a comment if content is empty and attachments are present', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
            .field('content', '')
            .attach('Attachments', fileToAttachPath)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe('')
        expect(data.attachments).toBeDefined()
        expect(Array.isArray(data.attachments)).toBe(true)
        expect(data.attachments.length).toBe(1)
        expect(data.attachments[0].name).toBe(fileToAttachName)
    })

    it('should return 400 if comment content is too long', async () => {
        const content = 'a'.repeat(10000)
        const response = await request(app)
            .post(`/organizations/${orgId}/clients/${clientId}/comments`)
            .send({ content })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if the client is not in the organization', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/clients/${strangerClientId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
