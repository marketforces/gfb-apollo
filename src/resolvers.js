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
        buildQueue: 1,
        //Temporary token for testing, will be replaced with client data
        accessToken:
          "EAAn4L3S8ykMBAPfCKO9B960BVc0uUKUxTxfDhugEKWZBtNxUf5TQ0f9CHphyA2q0WP9P2RkaEQjWlDpMwck9CbpKzQPcZBphZARH73lpBabxnC0ok6gGXcr7ZCmLFSPC1SY9aUNVFZBL9XJatA2WL8ODOpMjdnVI9WLa0Eymm10TIYyd1X0ZCJShB5NGjuGs9vLOvLVblfcVVvnld8PqJwYGhWsSy9VgV2GawnBhNPBAZDZD"
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
