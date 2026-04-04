const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { comments, organizations, clients, expenses, attachments } from '../../../../../db/schema'
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
        clientId: clientId,
    }).returning().then(r => r[0])
    expenseId = expense.id

    const strangerExpense = await db.insert(expenses).values({
        ...fake.mockExpenseData(),
        organizationId: (orgResults[1]?.id || orgResults[0].id),
        clientId: clientId,
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

describe('Update comment for expense', () => {
    it('should update a comment for a expense', async () => {
        const commentData = fake.mockCommentData()
        const comment = await db.insert(comments).values({
            ...commentData,
            expenseId: expenseId,
            organizationId: orgId,
        }).returning().then(r => r[0])

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/comments/${comment.id}`
            )
            .send({ content: 'new content' })
            .expect(200)

        const { status } = response.body

        expect(status).toBe('success')

        // get the updated comment
        const updatedComment = (await db.select().from(comments).where(eq(comments.id, comment.id)))[0]
        expect(updatedComment.content).toBe('new content')
    })

    it('should not update a comment for a expense that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await db.insert(comments).values({
            ...commentData,
            expenseId: strangerexpenseId,
            organizationId: (orgResults[1]?.id || orgResults[0].id),
        }).returning().then(r => r[0])

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${strangerexpenseId}/comments/${comment.id}`
            )
            .send({ content: 'new content' })
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should update a comment for a expense with attachments', async () => {
        const comment = await db.insert(comments).values({
            content: 'Original content',
            expenseId: expenseId,
            organizationId: orgId,
        }).returning().then(r => r[0])

        const response = await request(app)
            .put(
                `/organizations/${orgId}/expenses/${expenseId}/comments/${comment.id}`
            )
            .field('content', 'new content')
            .attach('Attachments', fileToAttachPath) // Pass a single file path
            .expect(200)

        const { status } = response.body
        expect(status).toBe('success')

        // // delay to wait for the file to be uploaded to s3
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Get the updated comment
        const updatedComment = await db.query.comments.findFirst({ where: eq(comments.id, comment.id), with: { attachments: true } })
        expect(updatedComment.content).toBe('new content')
        expect(updatedComment.attachments.length).toBe(1)
    })
})
