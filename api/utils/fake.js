const { faker } = require('@faker-js/faker')
const {
    User,
    Organization,
    Address,
    OrganizationMember,
    Contract,
} = require('../db/index')

// Function to generate fake data for the "Users" table
// A user is someone who is registered with the application (they have an account)
const mockUserData = () => {
    return {
        username: faker.internet.userName(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        password: faker.internet.password(),
        avatarUrl: faker.image.url(),
        refreshToken: faker.string.uuid(),
    }
}

// Function to generate fake data for the "Organizations" table
const mockOrganizationData = () => {
    return {
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        website: faker.internet.url(),
        logoUrl: faker.image.url(),
    }
}

// Function to generate fake data for the "OrganizationMembers" table.
// An organization member is someone who is a member of an organization.
// They may or may not have an account with the application.
const mockOrgMemberData = () => {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        permissions: 5,
    }
}

// Function to generate fake data for the "Clients" table
const mockClientData = () => {
    return {
        name: faker.company.name(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        website: faker.internet.url(),
        description: faker.company.catchPhrase(),
    }
}

// Function to generate fake vendor data for the "Vendors" table
const mockVendorData = () => {
    return {
        name: faker.company.name(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        website: faker.internet.url(),
        description: faker.company.catchPhrase(),
    }
}

// Function to generate fake data for the "Addresses" table
const mockAddressData = () => {
    return {
        country: faker.location.country(),
        postalCode: faker.location.zipCode(),
        province: faker.location.state(),
        city: faker.location.city(),
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.location.secondaryAddress(),
    }
}

// Function to generate fake data for the "Contracts" table
const mockContractData = () => {
    return {
        name: faker.lorem.words(),
        description: faker.lorem.paragraph(),
        startDate: faker.date.past(),
        dueDate: faker.date.future(),
        completionDate: faker.date.recent(),
        status: faker.number.int({ min: 0, max: 1 }),
    }
}

// Function to generate fake data for the "Jobs" table
const mockJobData = () => {
    return {
        identifier: faker.string.uuid(),
        name: faker.person.jobTitle(),
        description: faker.lorem.paragraph(),
        status: faker.number.int({ min: 0, max: 1 }),
    }
}

// Generate fake data for Expenses table
const generateExpensesData = () => {
    return {
        description: faker.lorem.sentence(),
        date: faker.date.past(),
    }
}

// Generate fake data for Invoices table
const generateInvoicesData = () => {
    return {
        invoiceNumber: faker.string.alphanumeric(8),
        invoiceDate: faker.date.past(),
        dueDate: faker.date.future(),
        poNumber: faker.string.alphanumeric(8),
        note: faker.lorem.sentence(),
        taxRate: faker.number.int({ min: 0, max: 10 }),
    }
}

// Generate fake data for ExpenseEntries table
const generateExpenseEntriesData = () => {
    return {
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        unitCost: faker.number.int({ min: 10, max: 100 }),
    }
}

// Generate fake data for InvoiceEntries table
const generateInvoiceEntriesData = () => {
    return {
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        unitCost: faker.number.int({ min: 10, max: 100 }),
    }
}

const populate = async () => {
    async function generateDataFor(user) {
        // USER ADDRESS -------------------------------------------------------
        // Creates and persists an address in the db
        const address = await Address.create(mockAddressData())
        address.updatedByUserId = user.id // Set the updatedByUserId field to the user's id
        await address.save() // Persist the above change to the db
        user.setAddress(address) // Set and persist the address association to the user

        // ORGANIZATION -------------------------------------------------------
        // Builds an organization object but does not persist it to the db
        // ownerId is required, which is why we build the object first with all the required fields, then save it
        let org = Organization.build(mockOrganizationData())
        org.set({
            // Alternative way to set multiple fields at once
            updatedByUserId: user.id,
            ownerId: user.id,
        })
        org = await org.save() // Persist the above changes to the db

        // ORGANIZATION ADDRESS -----------------------------------------------
        // Creates, persists, and sets the address association to the organization in one step
        await org.createAddress(mockAddressData())

        // ORGANIZATION MEMBER -----------------------------------------------
        // Builds an organization member object but does not persist it to the db
        const member = OrganizationMember.build(mockOrgMemberData())
        member.set({
            // Alternative way to set multiple fields at once
            updatedByUserId: user.id,
            OrganizationId: org.id, // the OrganizationId field is required. This is the organization that the member belongs to
            UserId: user.id, // the UserId field is not required. If the member has an account, this is the user that the member belongs to
        })
        member.save() // Persist the above changes to the db

        // ORGANIZATION CLIENT -----------------------------------------------
        // Creates and persists a client in the db
        const client = await org.createClient(mockClientData())
        client.setUpdatedByUser(user) // Sets and persists the updatedByUser association to the user

        // ORGANIZATION CONTRACT ---------------------------------------------
        // Creates and persists a contract in the db
        let contract = Contract.build(mockContractData())
        contract.set({
            ClientId: client.id, // The ClientId field is required. This is the client that the contract belongs to
            OrganizationId: org.id, // The OrganizationId field is required. This is the organization that the contract belongs to
            updatedByUserId: user.id,
        })
        contract = await contract.save() // Persist the above changes to the db
        const contractMember = await contract.addOrganizationMember(member) // Add the member to the contract (they can now view the contract)

        // CONTRACT JOB -------------------------------------------------------
        // Creates and persists a job in the db
        const job = await contract.createJob(mockJobData())
        job.setUpdatedByUser(user) // Sets and persists the updatedByUser association to the user
        job.addContractMember(contractMember, {
            // Add the contract member to the job (they can now view the job)
            through: {
                permissionOverwrites: 1, // in the job.js model file, we set the association to go through the JobMember junction table. This field is part of that junction table
            },
        })

        // ORGANIZATION VENDOR ------------------------------------------------
        // Instead of using setUpdatedByUser, we directly set the updatedByUserId field to the user's id to avoid the extra db call
        const vendor = await org.createVendor({
            ...mockVendorData(),
            updatedByUserId: user.id,
        })

        // VENDOR ADDRESS -----------------------------------------------------
        // Creates, persists, and sets the address association to the vendor
        await vendor.createAddress(mockAddressData())

        // EXPENSE -----------------------------------------------------
        // Creates and persists an expense in the db
        const expense = await org.createExpense({
            ...generateExpensesData(),
            updatedByUserId: user.id,
        })
        expense.setVendor(vendor) // Sets and persists the vendor association to the expense

        for (let i = 0; i < 5; i++) {
            await expense.createExpenseEntry({
                ...generateExpenseEntriesData(),
                updatedByUserId: user.id,
            })
        }

        // INVOICE -----------------------------------------------------
        // Creates and persists an invoice in the db
        const invoice = await org.createInvoice({
            ...generateInvoicesData(),
            updatedByUserId: user.id,
        })
        invoice.setBillToClient(client) // Sets and persists the client association to the invoice

        // INVOICE ENTRIES ---------------------------------------------
        for (let i = 0; i < 5; i++) {
            await invoice.createInvoiceEntry({
                ...generateInvoiceEntriesData(),
                updatedByUserId: user.id,
            })
        }
    }

    // To see which special methods are available on a model, print its prototype property like console.log(Organization.prototype)
    for (let i = 0; i < 10; i++) {
        // USER ---------------------------------------------------------------
        // Creates and persists a user in the db
        const user = await User.create(mockUserData())
        user.setUpdatedByUser(user) // Sets and persists the updatedByUser association to itself

        await generateDataFor(user)
    }

    // Add the dev user.
    const devUser = await User.create({
        ...mockUserData(),
        id: process.env.DEV_USER_UUID,
        username: process.env.DEV_USER_USERNAME,
    })

    await generateDataFor(devUser)
}

module.exports = {
    mockUserData,
    mockOrganizationData,
    mockClientData,
    mockAddressData,
    mockContractData,
    mockJobData,
    populate,
}
