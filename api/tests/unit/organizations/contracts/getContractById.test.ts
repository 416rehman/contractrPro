const request = require('supertest')
const app = require('../../../../server')
const { sequelize, Contract, Organization } = require('../../../../db')
const { Op } = require('sequelize')

let orgID, contract, emptyOrgID, emptyContractID, strangerContract

beforeAll(async () => {
    const orgs = await Organization.findAll()
    orgID = orgs[0].id

    contract = await Contract.findOne({
        where: { OrganizationId: orgID },
    })

    strangerContract = await Contract.findOne({
        where: { OrganizationId: { [Op.ne]: orgID } },
    })
})

afterAll(async () => {
    jest.restoreAllMocks()
    await sequelize.close()
})

describe(`GET /organizations/:org_id/contracts/:contract_id`, () => {
    test(`Should return success if an organization's contract is found`, async () => {
        const response = await request(app)
            .get(`/organizations/${orgID}/contracts/${contract.id}`)
            .expect(200)

        expect(response.body.status).toBe('success')
        expect(response.body.data).not.toBeInstanceOf(Array)
        expect(response.body.data).toHaveProperty('id')
        expect(response.body.data).toHaveProperty('name')
        expect(response.body.data).toHaveProperty('description')
        expect(response.body.data).toHaveProperty('startDate')
        expect(response.body.data).toHaveProperty('dueDate')
        expect(response.body.data).toHaveProperty('completionDate')
        expect(response.body.data).toHaveProperty('status')
        expect(response.body.data).toHaveProperty('createdAt')
        expect(response.body.data).toHaveProperty('updatedAt')
        expect(response.body.data).toHaveProperty('UpdatedByUserId')
        expect(response.body.data).toHaveProperty('OrganizationId')
        expect(response.body.data).toHaveProperty('ClientId')
    })

    test(`Should return error for not requiring an organization ID`, async () => {
        emptyOrgID = null

        const res = await request(app)
            .get(`/organizations/${emptyOrgID}/contracts/${contract.id}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })

    test(`Should return error for not requiring an organization's contract's ID`, async () => {
        emptyContractID = null

        const res = await request(app)
            .get(`/organizations/${orgID}/contracts/${emptyContractID}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })

    test(`Should return error for trying to find a contract from an organization that doesn't exist`, async () => {
        orgID = '550e8400-e29b-41d4-a716-446655430000'

        const res = await request(app)
            .get(`/organizations/${orgID}/contracts/${contract.id}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })

    test(`Should return error for finding an organization's contract that doesn't exist`, async () => {
        const res = await request(app)
            .get(`/organizations/${orgID}/contracts/${strangerContract.id}`)
            .expect((res) => res.status === 400 || res.status === 422) // Express-validator returns 422 for validation errors

        expect(res.body.status).toBe('error')
    })
})
