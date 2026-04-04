const request = require('supertest')
const app = require('../../../../../server')
import { db } from '../../../../../db/index'
import { comments, organizations, clients, contracts } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { clearDatabase } from '../../../../utils/testDB'

import * as fake from '../../../../../utils/fake'

let orgId, contractId, comment, clientId
beforeAll(async () => {
    const org = await Organization.findAll({ limit: 1 })
    orgId = org[0].id

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

    comment = await db.insert(comments).values({
        ...fake.mockCommentData().returning().then(r => r[0]),
        OrganizationId: orgId,
        ContractId: contractId,
        AuthorId: process.env.DEV_USER_UUID,
    })
})

afterAll(async () => {
    jest.restoreAllMocks()
    await clearDatabase()
})

describe('Get comments for contract', () => {
    it('should get comments for a contract', async () => {
        const response = await request(app)
            .get(`/organizations/${orgId}/contracts/${contractId}/comments`)
            .expect(200)

        const { status, data } = response.body

        expect(status).toBe('success')
        expect(data.comments).toBeDefined()
        expect(Array.isArray(data.comments)).toBe(true)
        expect(data.comments.length).toBeGreaterThan(0)

        // expect comment to be in the response
        const commentInResponse = data.comments.find((c) => c.id === comment.id)
        expect(commentInResponse).toBeDefined()
        expect(commentInResponse.content).toBe(comment.content)
    })

    it('should return 403 if organization ID is invalid', async () => {
        const invalidOrgId = 'invalid-org-id'

        const response = await request(app)
            .get(
                `/organizations/${invalidOrgId}/contracts/${contractId}/comments`
            )
            .expect(403)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if contract ID is invalid', async () => {
        const invalidContractId = 'invalid-contract-id'

        const response = await request(app)
            .get(
                `/organizations/${orgId}/contracts/${invalidContractId}/comments`
            )
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if contract does not belong to organization', async () => {
        const contractId = 'non-existing-contract-id'

        const response = await request(app)
            .get(`/organizations/${orgId}/contracts/${contractId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })

    it('should return 400 if an error occurs during the transaction', async () => {
        // Mock the transaction to throw an error
        jest.spyOn(Comment, 'findAndCountAll').mockImplementation(() => {
            throw new Error('Something went wrong')
        })

        const response = await request(app)
            .get(`/organizations/${orgId}/contracts/${contractId}/comments`)
            .expect(400)

        const { status } = response.body

        expect(status).toBe('error')
    })
})
