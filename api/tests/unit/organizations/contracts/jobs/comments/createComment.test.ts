const request = require('supertest')
const _app = require('../../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../../db/index'
import { contracts, clients, organizations, jobs } from '../../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../../utils/testDB'

import * as fake from '../../../../../../utils/fake'
const fs = require('fs')

let orgId, jobId, strangerOrganizationId, strangerJobId, clientId, contractId
let fileToAttachPath, fileContent, fileToAttachName
beforeAll(async () => {
    const org = await db.select().from(organizations)
    orgId = org[0].id
    const [strangerOrg] = await db.insert(organizations).values(fake.mockOrganizationData()).returning();
    strangerOrganizationId = strangerOrg.id

    const [client] = await db.insert(clients).values({ ...fake.mockClientData(), organizationId: orgId, }).returning()
    clientId = client.id

    const [contract] = await db.insert(contracts).values({ ...fake.mockContractData(), organizationId: orgId,
        clientId: clientId, }).returning()
    contractId = contract.id

    const [strangerContract] = await db.insert(contracts).values({ ...fake.mockContractData(), organizationId: strangerOrganizationId,
        clientId: clientId, }).returning()

    const [job] = await db.insert(jobs).values({ ...fake.mockJobData(), contractId: contractId,
        organizationId: orgId,
        }).returning()
    jobId = job.id

    const [strangerJob] = await db.insert(jobs).values({ ...fake.mockJobData(), organizationId: strangerOrganizationId,
        contractId: strangerContract.id, }).returning()
    strangerJobId = strangerJob.id

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

describe('Create comment for job', () => {
    it('should create a comment for a job with no attachments', async () => {
        const commentData = fake.mockCommentData()
        if (typeof app !== 'function') {
            console.error('APP IS NOT A FUNCTION IN TEST! type:', typeof app, 'keys:', Object.keys(app || {}));
        }
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .send(commentData)
        if (response.status !== 200) {
            fs.writeFileSync('tmp/error_debug.json', JSON.stringify({ body: response.body, text: response.text }, null, 2))
        }
        expect(response.status).toBe(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe(commentData.content)
    })

    it('should create a comment for a job with attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .field('content', commentData.content)
            .attach('Attachments', fileToAttachPath)

        const { status, data } = response.body
        
        expect(response.status).toBe(200)
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
            .post(
                `/organizations/${invalidOrgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if job ID is invalid', async () => {
        const invalidJobId = 'invalid-job-id'

        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${invalidJobId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is missing', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is empty and no attachments', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .field('content', '')
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should create a comment if content is empty and attachments are present', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
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
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments`
            )
            .send({ content })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if the job is not in the organization', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${strangerJobId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
