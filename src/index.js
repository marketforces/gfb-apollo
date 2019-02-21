const { ApolloServer, gql } = require("apollo-server")

const typeDefs = require("./schema")
const resolvers = require("./resolvers")
const FacebookAPI = require("./datasources/facebook")
const UserAPI = require("./datasources/user")

let isAuthenticated = require("./auth")
const createStore = require("./util")
const store = createStore()

const server = new ApolloServer({
  context: async ({ req }) => {
    let authToken,
      fbAccountId,
      apiKey,
      user = null

    // Extract API Key from request URI
    let requestKey = req.originalUrl.substring(1)

    // If this is a build request, set user from buildQueue
    if (requestKey === "build") {
      // Find a user by buildQueue
      user = await store.users.findOne({ where: { buildQueue: 1 } })

      if (!user) {
        throw new Error("Bad Request: Build request failed - no user queued.")
      }

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

      // // If no ad account ID, return null for user
      if (!fbAccountId) return { user: null, apiKey, requestKey, authToken }

      // Find a user by their ad account id
      user = await store.users.findOne({ where: { fbAccountId } })
      apiKey = user.apiKey ? user.apiKey : apiKey

      if (!user) {
        throw new Error("Bad Request: No user found.")
      }
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
    userAPI: new UserAPI({ store })
  })
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server live at ${url}`)
})
