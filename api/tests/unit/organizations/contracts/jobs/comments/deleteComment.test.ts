const request = require('supertest')
const app = require('../../../../../../server')
import { db } from '../../../../../../db/index'
import { comments, organizations, clients, jobs, contracts } from '../../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../../utils/testDB'

import * as fake from '../../../../../../utils/fake'
const fs = require('fs')

let orgId, jobId, strangerOrganizationId, strangerJobId, clientId, contractId
let fileContent, fileToAttachName
beforeAll(async () => {
    const org = await db.select().from(organizations)
    orgId = org[0].id
    strangerOrganizationId = org[1].id

    const client = await db.insert(clients).values({
        ...fake.mockClientData().returning().then(r => r[0]),
        OrganizationId: orgId,
    })
    clientId = client.id

    const contract = await db.insert(contracts).values({
        ...fake.mockContractData().returning().then(r => r[0]),
        OrganizationId: orgId,
        ClientId: clientId,
    })
    contractId = contract.id

    const strangerContract = await db.insert(contracts).values({
        ...fake.mockContractData().returning().then(r => r[0]),
        OrganizationId: strangerOrganizationId,
        ClientId: clientId,
    })

    const job = await db.insert(jobs).values({
        ...fake.mockJobData().returning().then(r => r[0]),
        ContractId: contractId,
        OrganizationId: orgId,
        ClientId: clientId,
    })
    jobId = job.id

    const strangerJob = await db.insert(jobs).values({
        ...fake.mockJobData().returning().then(r => r[0]),
        OrganizationId: strangerOrganizationId,
        ClientId: clientId,
        ContractId: strangerContract.id,
    })
    strangerJobId = strangerJob.id

    // create a file and get its absolute path
    fileContent = 'test'
    fileToAttachName = 'test.txt'
    fs.writeFileSync(`./${fileToAttachName}`, fileContent)
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})

describe('Delete comment for job', () => {
    it('should delete a comment for a job', async () => {
        const commentData = fake.mockCommentData()
        const comment = await db.insert(comments).values({
            ...commentData,
            JobId: jobId,
            OrganizationId: orgId,
        }).returning().then(r => r[0])

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments/${comment.id}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should not delete a comment for a job that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await db.insert(comments).values({
            ...commentData,
            JobId: strangerJobId,
            OrganizationId: strangerOrganizationId,
        }).returning().then(r => r[0])

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${strangerJobId}/comments/${comment.id}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should not delete a comment for a job that does not exist', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${contractId}/jobs/${jobId}/comments/999999`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
