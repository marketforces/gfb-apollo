const { ApolloServer, gql } = require("apollo-server")

const typeDefs = require("./schema")
const resolvers = require("./resolvers")
const FacebookAPI = require("./datasources/facebook")
const UserAPI = require("./datasources/user")

const createStore = require("./util")
const store = createStore()

const server = new ApolloServer({
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
