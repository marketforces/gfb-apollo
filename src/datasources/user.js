const { DataSource } = require("apollo-datasource")

class UserAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  keyFromContext() {
    const { apiKey } = this.context
    return apiKey
  }

  async findOrCreateUser({
    adAccountId: adAccountIdArg,
    apiKey,
    accessToken,
    buildQueue
  } = {}) {
    const adAccountId =
      this.context && this.context.user
        ? this.context.user.adAccountId
        : adAccountIdArg
    if (!adAccountId) return null

    const users = await this.store.users.findOrCreate({
      where: { adAccountId, apiKey, accessToken, buildQueue }
    })
    const user = users && users[0] ? users[0] : null

    return user
  }

  async findUserOnContext() {
    const adAccountId =
      this.context && this.context.user ? this.context.user.adAccountId : null
    if (!adAccountId) return null

    const user = await this.store.users.findOne({
      where: { adAccountId }
    })

    return user
  }

  async findUserByFbAccountId({ adAccountId: adAccountIdArg } = {}) {
    const user = await this.store.users.findOne()
    return user
  }
}

module.exports = UserAPI
