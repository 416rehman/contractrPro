Okay when you are done with that we need the following:

1. Right now I am not using confirmation codes properly (I have one confirm api that does everything but that doesnt seem right, like we should have a changePassword route instead, that also requires a PASSWORD_RESET code accompanied with the new password, no? This philosophy should be used for all CRITICAL POST/PUT routes, like delete org, etc? no?)

2.  Alot of the routes have repeated logic, middleware would be nice. Lots of repetition of stuff like (comments, which then have attachments etc), only difference being is roles etc at each route and relativity to the resource.. this could be made better no? How does this affect openapi documentation?

3.  Also EVERY SINGLE ROUTE NEEDS ZOD SPEC. Just like the OPENAPI Spec, the ZOD schema needs to be in the SAME file as each route. And then all validation failures can use a single error code. Also the OpenAPI docs should be VERY detailed so bot developers can rely on them. Docs should not reveal the internals like the blob routes should not say we get the blob from S3... etc OpenAPI docs need to be very detailed, like side effects of each delete, post, put, etc. things the devs should know, eliminate any confusion, etc. What if a route takes files? etc you need to document EVERY SINGLE THING, cookies, etc.

4. Use scaler to serve the open-api specs instead of the default UI. More: https://guides.scalar.com/scalar/scalar-api-references/integrations/express

5. Make sure the APIs make sense, there is no room for vulnerability, data enumeration, or other security concerns (i.e should /users/{user_id} be just public? organizations? etc?) Scrutinize, provide suggestions, and improve them as you see fit. Scrutinize it all under OWASP cheat sheets etc, like also how about masking of PII? Security and compliance is PARAMOUNT.

6. Bots will use websockets to respond to events (same architecture as discord bots, organizations add bots to their orgs, they receive websocket events and do stuff with them, interact with our api etc, again this has to be researched EXTREMELY DETAILED AND BEST IMPLEMENTAION WITH EVERYTHING CONSIDERED)

7. Implement proper rate limiting where it makes sense (i.e public routes, authenticated routes, critical routes, etc what about bots? how does rate limiting come into effect for bots? prevent abuse, but also dont kneecap the capabilities of a bot, do research etc to see how this could work. The rate limits should also be part of the api documentation

8. Backend should generate types, and frontend should use those types. Using: https://github.com/openapi-ts/openapi-typescript