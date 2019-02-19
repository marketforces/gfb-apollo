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
    // Extract API Key from request URI
    let apiKey = req.originalUrl.substring(1)

    // Check auth token on every request
    const authToken = (req.headers && req.headers.authorization) || ""

    // Parse Authorization Token
    const parsedAuthToken = Buffer.from(authToken, "base64")
      .toString("ascii")
      .split(",")

    // Set Account ID and API Key where available
    const adAccountId = !!parsedAuthToken[0] && parsedAuthToken[0]
    apiKey = !!parsedAuthToken[1] ? parsedAuthToken[1] : apiKey

    // If no ad account ID, return null for user
    if (!adAccountId) return { user: null, apiKey, authToken }

    // Find a user by their ad account id, or create one
    const users = await store.users.findOrCreate({ where: { adAccountId } })
    const user = users && users[0] ? users[0] : null

    // Set up context
    return {
      user: { ...user.dataValues },
      apiKey,
      authToken,
      adAccountId
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
  console.log(`🚀 Server ready at ${url}`)
})
