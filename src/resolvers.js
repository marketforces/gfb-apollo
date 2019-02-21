module.exports = {
  Query: {
    fbaccountid: (_, { loginToken }, { dataSources }) => {
      const accessToken = loginToken
      return dataSources.facebookAPI.getAccountId({ accessToken })
    },
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
    authToken: async (_, { loginToken }, { dataSources }) => {
      let apiKey = dataSources.userAPI.keyFromContext()
      let user, adAccountId, fbAccountId, accessToken
      let buildQueue = 1

      // Parse Authorization Token
      let parsedLoginToken = Buffer.from(loginToken, "base64").toString("ascii")

      try {
        parsedLoginToken = JSON.parse(parsedLoginToken)
        console.log("Logging in with generated login token")
        apiKey = parsedLoginToken.apiKey ? parsedLoginToken.apiKey : apiKey
        adAccountId = parsedLoginToken.adAccountId
        accessToken = parsedLoginToken.accessToken

        console.log("\nParsed Login Token:", parsedLoginToken, "\n")

        user = await dataSources.userAPI.findOrCreateUser({
          apiKey,
          adAccountId,
          buildQueue,
          accessToken
        })
      } catch (e) {
        accessToken = loginToken
        console.log("Logging in with FB access token:", accessToken)
        fbAccountId = await dataSources.facebookAPI.getAccountId({
          accessToken
        })
        fbAccountId = fbAccountId.id
        user = await dataSources.userAPI.findOrCreateUser({
          apiKey,
          fbAccountId,
          buildQueue,
          accessToken
        })
      }

      if (user)
        return Buffer.from(`${fbAccountId},${apiKey}`).toString("base64")
      else throw new Error("API Login Failure.  User does not exist.")
    },
    appId: (_, __, ___) => {
      return process.env.APP_ID
    },
    isUser: async (_, { fbAccountId }, { dataSources }) => {
      const user = (await dataSources.userAPI.userExists({ fbAccountId })) || {}
      const isReady = !!user && !!user.apiKey && !!user.adAccountId
      const { apiKey, adAccountId, accessToken } = user
      const tokenData = JSON.stringify({
        apiKey,
        adAccountId,
        accessToken
      })
      const token = Buffer.from(tokenData).toString("base64")
      return { exists: !!user.id, isReady, token }
    },
    updateUser: async (
      _,
      { adAccountId, apiKey, buildQueue, accessToken },
      { dataSources }
    ) => {
      const user =
        (await dataSources.userAPI.update({
          adAccountId,
          apiKey,
          buildQueue,
          accessToken
        })) || {}

      const { fbAccountId } = user

      return Buffer.from(`${fbAccountId},${apiKey}`).toString("base64")
    }
  }
}
