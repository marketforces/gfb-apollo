module.exports = {
  Query: {
    account: (_, { id }, { dataSources }) =>
      dataSources.facebookAPI.getAccountById({ accountId: id }),
    adcreatives: (_, { id, limit, after }, { dataSources }) => {
      limit = limit || 25
      return dataSources.facebookAPI.getAdCreatives({ id, limit, after })
    },

    me: async (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
  }
}
