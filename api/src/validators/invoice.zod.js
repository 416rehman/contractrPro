const { z } = require('zod')
module.exports.zInvoice = z.object({
    invoiceNumber: z.string().max(64),
    description: z.string().max(512).optional(),
    issueDate: z.date(),
    dueDate: z.date().optional(),
    poNumber: z.string().max(128).optional(),
    note: z.string().max(512).optional(),
    taxRate: z.number(),
    paymentDate: z.date().optional(),
    clientId: z.string().cuid2(),
    contractId: z.string().cuid2().optional(),
})

module.exports.zInvoiceEntry = z.object({
    name: z.string().max(128),
    description: z.string().max(128).optional(),
    quantity: z.number(),
    unitPrice: z.number(),
    unit: z.string().max(32).optional(),
})