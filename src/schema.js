const { ApolloServer, gql } = require("apollo-server")

const Account = gql`
  type Account {
    id: ID!
    account_id: String
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

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  ${Account}
  ${AdCreativesResponse}
  ${User}
  type Query {
    account(id: ID!): Account
    adcreatives(id: ID!, limit: Int, after: String): AdCreativesResponse
    me: User
  }
`
module.exports = typeDefs
