module.exports = {
  Query: {
    adaccounts: (_, __, { dataSources }) =>
      dataSources.facebookAPI.getAdAccounts(),
    adcreatives: (_, { limit, after }, { dataSources }) => {
      limit = limit || 25
      return dataSources.facebookAPI.getAdCreatives({ limit, after })
    },
    me: async (_, __, { dataSources }) =>
      dataSources.userAPI.findUserOnContext()
  },
  Mutation: {
    authToken: async (_, { adAccountId }, { dataSources }) => {
      const apiKey = dataSources.userAPI.keyFromContext()

      const user = await dataSources.userAPI.findOrCreateUser({
        apiKey,
        adAccountId,
        accessToken:
          "EAAn4L3S8ykMBANxXuPQOw5TNJzYVUV7SpZCLIYxZCINaSfu5WyFLSFV3jMMrpRqk5IFOYxvwANgnWsn4X67TPHYPGwfnRZB6yXcKkGGlfFTcdppcW2TSlAW3VM44oUu5ouGB8YzlFD6nD6sV1ZAgBhirZBIySUAQ7q8xt8WNQPYv3SMldhFqiv1ZAehLPd1KhrITDAhook1jC9rdsOgBF3Q6kZA2iUQHJiPQzSH2XtyxwZDZD"
      })

      if (user)
        return Buffer.from(`${adAccountId},${apiKey}`).toString("base64")
      else throw new Error("API Login Failure.  User does not exist.")
    },
    appId: (_, __, ___) => {
      return process.env.APP_ID
    }
  }
}
