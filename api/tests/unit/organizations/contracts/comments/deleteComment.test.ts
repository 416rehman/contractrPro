const request = require('supertest')
const app = require('../../../../../server')
import { db } from '../../../../../db/index'
import { comments, organizations, clients, contracts } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, contractId, strangerOrganizationId, strangerContractId, clientId
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
    strangerContractId = strangerContract.id
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})

describe('Delete comment for contract', () => {
    it('should delete a comment for a contract', async () => {
        const commentData = fake.mockCommentData()
        const comment = await db.insert(comments).values({
            ...commentData,
            ContractId: contractId,
            OrganizationId: orgId,
        }).returning().then(r => r[0])

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${contractId}/comments/${comment.id}`
            )
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data).toBe(1)
    })

    it('should not delete a comment for a contract that does not belong to the organization', async () => {
        const commentData = fake.mockCommentData()
        const comment = await db.insert(comments).values({
            ...commentData,
            ContractId: strangerContractId,
            OrganizationId: strangerOrganizationId,
        }).returning().then(r => r[0])

        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${strangerContractId}/comments/${comment.id}`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should not delete a comment for a contract that does not exist', async () => {
        const response = await request(app)
            .delete(
                `/organizations/${orgId}/contracts/${contractId}/comments/999999`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
