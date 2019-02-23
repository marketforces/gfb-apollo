const { ApolloServer, gql } = require("apollo-server")

const typeDefs = require("./schema")
const resolvers = require("./resolvers")
const FacebookAPI = require("./datasources/facebook")
const UserAPI = require("./datasources/user")
const BuildAPI = require("./datasources/build")

let isAuthenticated = require("./auth")
const createStore = require("./util")
const store = createStore()

const server = new ApolloServer({
  context: async ({ req }) => {
    let authToken,
      fbAccountId,
      apiKey,
      user = null

    // Extract Request Key from request URI
    let requestKey = req.originalUrl.substring(1)

    if (!requestKey) {
      throw new Error("Bad Request: Invalid request key.")
    }

    // If this is a build request, set user from buildQueue
    if (requestKey === "build") {
      // Find a user by buildQueue
      user = await store.users.findOne({ where: { buildQueue: 1 } })

      if (!user) {
        throw new Error("Bad Request: Build request failed - no user queued.")
      }

      // Generate user auth token
      fbAccountId = user.fbAccountId
      apiKey = user.apiKey
      authToken = Buffer.from(`${fbAccountId},${apiKey}`).toString("base64")

      // Otherwise handle data normally
    } else {
      // Check auth token on every request
      authToken = (req.headers && req.headers.authorization) || ""

      // Parse Authorization Token
      const parsedAuthToken = Buffer.from(authToken, "base64")
        .toString("ascii")
        .split(",")

      console.log("\nParsed Auth Token: ", parsedAuthToken)

      // Set Account ID and API Key where available
      fbAccountId = !!parsedAuthToken[0] && parsedAuthToken[0]
      apiKey = !!parsedAuthToken[1] ? parsedAuthToken[1] : requestKey

      if (!apiKey && !fbAccountId) {
        throw new Error("Bad Request: Missing Authorization")
      }

      // If no FB account ID, a new user needs to be created
      // thus, we return here in order continue to the `authToken`
      // resolver.
      if (!fbAccountId) return { user: null, apiKey, requestKey, authToken }

      // Find a user by their FB account ID
      user = await store.users.findOne({ where: { fbAccountId } })
      if (!user) {
        throw new Error("Bad Request: No user found.")
      }
      apiKey = user.apiKey ? user.apiKey : apiKey
    }

    console.log("\nRequest Details", {
      user: user.dataValues,
      requestKey,
      apiKey,
      authToken,
      fbAccountId
    })

    // Set up context
    return {
      user: { ...user.dataValues },
      userModel: user,
      apiKey,
      requestKey,
      authToken,
      fbAccountId
    }
  },
  typeDefs,
  resolvers,
  dataSources: () => ({
    facebookAPI: new FacebookAPI(),
    userAPI: new UserAPI({ store }),
    buildAPI: new BuildAPI()
  })
})

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server live at ${url}`)
})
