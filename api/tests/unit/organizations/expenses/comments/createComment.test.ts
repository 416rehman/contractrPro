const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { clients, organizations, expenses } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'
const fs = require('fs')

let orgId, expenseId, (orgResults[1]?.id || orgResults[0].id), strangerexpenseId, clientId
let fileToAttachPath, fileContent, fileToAttachName
beforeAll(async () => {
    const org = await db.select().from(organizations)
    orgId = org[0].id
    const [strangerOrg] = await db.insert(organizations).values(fake.mockOrganizationData()).returning();
    (orgResults[1]?.id || orgResults[0].id) = strangerOrg.id

    const [client] = await db.insert(clients).values({ ...fake.mockClientData(), organizationId: orgId, }).returning()
    clientId = client.id

    const expense = await db.insert(expenses).values({
        ...fake.mockExpenseData(),
        organizationId: orgId,
    }).returning().then(r => r[0])
    expenseId = expense.id

    const strangerExpense = await db.insert(expenses).values({
        ...fake.mockExpenseData(),
        organizationId: (orgResults[1]?.id || orgResults[0].id),
    }).returning().then(r => r[0])
    strangerexpenseId = strangerExpense.id

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

describe('Create comment for expense', () => {
    it('should create a comment for a expense with no attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .send(commentData)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.content).toBe(commentData.content)
    })

    it('should create a comment for a expense with attachments', async () => {
        const commentData = fake.mockCommentData()
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
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
            .post(
                `/organizations/${invalidOrgId}/expenses/${expenseId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if expense ID is invalid', async () => {
        const invalidexpenseId = 'invalid-expense-id'

        const response = await request(app)
            .post(
                `/organizations/${orgId}/expenses/${invalidexpenseId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is missing', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if comment content is empty and no attachments', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .field('content', '')
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should create a comment if content is empty and attachments are present', async () => {
        const response = await request(app)
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
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
            .post(`/organizations/${orgId}/expenses/${expenseId}/comments`)
            .send({ content })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if the expense is not in the organization', async () => {
        const response = await request(app)
            .post(
                `/organizations/${orgId}/expenses/${strangerexpenseId}/comments`
            )
            .send(fake.mockCommentData())
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
