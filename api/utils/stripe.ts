const Stripe = require('stripe')

let stripeInstance: any = null

export const getStripe = () => {
    if (!stripeInstance) {
        const key = process.env.STRIPE_SECRET_KEY
        if (!key) {
            throw new Error('STRIPE_SECRET_KEY environment variable is not set')
        }
        stripeInstance = Stripe(key)
    }
    return stripeInstance
}

// checks if stripe is configured without throwing
export const isStripeConfigured = (): boolean => {
    return !!process.env.STRIPE_SECRET_KEY
}
