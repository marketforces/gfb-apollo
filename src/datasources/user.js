const { DataSource } = require("apollo-datasource")

const verifyAuth = require("../auth")

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

  async userExists({ fbAccountId }) {
    const user = await this.store.users.findOne({ where: { fbAccountId } })
    return user
  }

  async findOrCreateUser({
    adAccountId: adAccountIdArg,
    apiKey,
    fbAccountId,
    accessToken,
    buildQueue
  } = {}) {
    const adAccountId =
      this.context && this.context.user
        ? this.context.user.adAccountId
        : adAccountIdArg
    if (!adAccountId && !accessToken) return null

    const users = await this.store.users.findOrCreate({
      where: { adAccountId, apiKey, fbAccountId, accessToken, buildQueue }
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

  async isUser({ fbAccountId } = {}) {
    const user = (await this.userExists({ fbAccountId })) || {}
    const ready = !!user && !!user.apiKey && !!user.adAccountId
    const { apiKey, adAccountId, accessToken } = user
    const settings = { adAccountId }
    const tokenData = JSON.stringify({
      apiKey,
      fbAccountId,
      adAccountId,
      accessToken
    })
    const token = Buffer.from(tokenData).toString("base64")
    return { exists: !!user.id, ready, token, settings }
  }

  async update({ adAccountId, apiKey, buildQueue, accessToken } = {}) {
    this.context.apiKey = apiKey ? apiKey : this.context.apiKey
    verifyAuth(this.context, 1)

    const { user, userModel } = this.context

    if (!userModel) return null

    userModel.update({
      adAccountId,
      apiKey,
      accessToken,
      buildQueue
    })

    const { fbAccountId } = user
    const updated = this.userExists({ fbAccountId })

    return updated
  }
}

module.exports = UserAPI
