const request = require('supertest')
const app = require('../../../../../server')
import { db } from '../../../../../db/index'
import { comments, organizations, clients, Expense } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'
const fs = require('fs')

let orgId, expenseId, strangerOrganizationId, strangerExpenseId, clientId
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

    const expense = await Expense.create({
        ...fake.mockExpenseData(),
        OrganizationId: orgId,
        ClientId: clientId,
    })
    expenseId = expense.id

    const strangerExpense = await Expense.create({
        ...fake.mockExpenseData(),
        OrganizationId: strangerOrganizationId,
        ClientId: clientId,
    })
    strangerExpenseId = strangerExpense.id

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
            ExpenseId: expenseId,
            OrganizationId: orgId,
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
            ExpenseId: strangerExpenseId,
            OrganizationId: strangerOrganizationId,
        }).returning().then(r => r[0])

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/expenses/${strangerExpenseId}/comments/${comment.id}`
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
