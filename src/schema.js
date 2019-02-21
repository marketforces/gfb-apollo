const { ApolloServer, gql } = require("apollo-server")

const Account = gql`
  type Account {
    id: ID!
  }
`

const AdAccount = gql`
  type AdAccount {
    id: ID!
  }
`

const AdAccountsResponse = gql`
  ${AdAccount}
  type AdAccountsResponse {
    results: [AdAccount]!
  }
`

const AdCreatives = gql`
  type AdCreatives {
    id: ID!
    title: String
    body: String
    object_story_id: String
    object_type: String
    image_url: String
  }
`

const AdCreativesResponse = gql`
  ${AdCreatives}
  type AdCreativesResponse {
    results: [AdCreatives]!
    hasMore: Boolean!
    after: String
  }
`

const User = gql`
  type User {
    id: ID!
    accessToken: String
    apiKey: String
    fbUserId: String
    createdAt: String
    updatedAt: String
  }
`

const IsUser = gql`
  type IsUser {
    exists: Boolean
    isReady: Boolean
    token: String
  }
`

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  ${Account}
  ${AdCreativesResponse}
  ${AdAccountsResponse}
  ${User}
  ${IsUser}
  type Query {
    fbaccountid(loginToken: String): Account
    adaccounts: AdAccountsResponse
    adcreatives(limit: Int, after: String): AdCreativesResponse
    me: User
  }
  type Mutation {
    appId: String
    authToken(loginToken: String): String # login token
    isUser(fbAccountId: String): IsUser
    updateUser(
      adAccountId: String
      apiKey: String
      accessToken: String
      buildQueue: Int
    ): String # login token
  }
`

module.exports = typeDefs
