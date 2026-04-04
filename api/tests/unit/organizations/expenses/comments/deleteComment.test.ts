const request = require('supertest')
const _app = require('../../../../../server'); const app = _app.default || _app;
import { db } from '../../../../../db/index'
import { comments, organizations, clients, expenses } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'
const fs = require('fs')

let orgId, expenseId, (orgResults[1]?.id || orgResults[0].id), strangerexpenseId, clientId
let fileContent, fileToAttachName
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
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})

describe('Delete comment for expense', () => {
    it('should delete a comment for a expense', async () => {
        const commentData = fake.mockCommentData()
        const comment = await db.insert(comments).values({
            ...commentData,
            expenseId: expenseId,
            organizationId: orgId,
        }).returning().then(r => r[0])

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/comments/${comment.id}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should not delete a comment for a expense that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await db.insert(comments).values({
            ...commentData,
            expenseId: strangerexpenseId,
            organizationId: (orgResults[1]?.id || orgResults[0].id),
        }).returning().then(r => r[0])

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${strangerexpenseId}/comments/${comment.id}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should not delete a comment for a expense that does not exist', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${expenseId}/comments/999999`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
