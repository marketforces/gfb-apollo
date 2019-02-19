module.exports = {
  Query: {
    account: (_, { id }, { dataSources }) =>
      dataSources.facebookAPI.getAccountById({ accountId: id }),
    adaccounts: (_, { access_token }, { dataSources }) =>
      dataSources.facebookAPI.getAdAccounts({ access_token }),
    adcreatives: (_, { id, limit, after }, { dataSources }) => {
      limit = limit || 25
      return dataSources.facebookAPI.getAdCreatives({ id, limit, after })
    },
    me: async (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
  },
  Mutation: {
    login: async (_, { adAccountId }, { dataSources }) => {
      const { user, apiKey } = await dataSources.userAPI.findOrCreateUser({
        adAccountId
      })
      if (user)
        return Buffer.from(`${adAccountId},${apiKey}`).toString("base64")
    }
  }
}
