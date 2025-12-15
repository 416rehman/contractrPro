Okay when you are done with that
1. [x] Refactor Auth Confirmation Logic
    - The current implementation of `confirm.ts` handles both email confirmation AND password reset logic. This is bad practice.
    - It also uses `token` for looking up the user, which is also bad practice.
    - We should refactor this to:
        - Have a separate route for `resetPassword` and `confirmEmail`
        - Use `token` to look up the `Token` model, then get the `userId` from that.
        - Ensure we're not leaking logic between the two flows.
        - Add tests for this flow.

2. [x] Implement middleware/factory for repeated logic
    - `createComment` handler is repeated across Clients, Contracts, Expenses, Invoices, Jobs, and Vendors.
    - `getComments`
    - `updateComment`
    - `deleteComment`
    - `deleteAttachment`
    - These should be refactored into a factory function `createCommentHandler(resourceModel)` etc.
    - This will reduce code duplication significantly.
    - Make sure to keep the `@openapi` comments in the route files though, as they are unique per route (tags, etc).

3.  [x] Use scaler to serve the open-api specs instead of the default UI. More: https://guides.scalar.com/scalar/scalar-api-references/integrations/express

4. FOR EACH SINGLE ROUTE:
    a. Add ZOD SPEC. Just like the OPENAPI Spec, the ZOD schema needs to be in the SAME file as each route. And then all validation failures can use a single error code. Also the OpenAPI docs should be VERY detailed so bot developers can rely on them. Docs should not reveal the internals like the blob routes should not say we get the blob from S3... etc OpenAPI docs need to be very detailed, like side effects of each delete, post, put, etc. things the devs should know, eliminate any confusion, etc. What if a route takes files? etc you need to document EVERY SINGLE THING, cookies, etc.
    b. Make sure the logic of endpoint make sense, there is no room for vulnerability, data enumeration, or other security concerns (i.e should /users/{user_id} be just public? organizations? etc?) Scrutinize, provide suggestions, and improve them as you see fit. Scrutinize it all under OWASP cheat sheets etc, like also how about masking of PII? Security and compliance is PARAMOUNT.
    c. Implement proper rate limiting where it makes sense (i.e public routes, authenticated routes, critical routes, etc what about bots? how does rate limiting come into effect for bots? prevent abuse, but also dont kneecap the capabilities of a bot, do research etc to see how this could work. The rate limits should also be part of the api documentation). Maximums/limits etc for each route should also be in the openapi spec, like what about pagination? abuse of limit in pagination etc
    d. Finally, after updating logic, provide complete openapi documentation, each resource needs to be PROPERLY explained to the developers, i.e. if someone is looking at the Client doc, they need to know what Client even is... EXTREMELY DETAILD (WITHOUT INTERNALS AS THIS IS PUBLIC FACING). Is the field required? Data type? Description? Rate limits? Permissions? Side effects? etc etc
    e. Use the proper permissions and middlewares for the route

6. Bots will use websockets to respond to events (same architecture as discord bots, organizations add bots to their orgs, they receive websocket events and do stuff with them, interact with our api etc, again this has to be researched EXTREMELY DETAILED AND BEST IMPLEMENTAION WITH EVERYTHING CONSIDERED)

8. Backend should generate types, and frontend should use those types. Using: https://github.com/openapi-ts/openapi-typescript