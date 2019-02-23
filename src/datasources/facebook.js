const { RESTDataSource } = require("apollo-datasource-rest")
const qs = require("qs")
const verifyAuth = require("../auth")

class FacebookAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = "https://graph.facebook.com/v3.2/"
  }

  async getAccountId({ accessToken }) {
    const { user } = this.context

    const edge = "me"
    const query = qs.stringify({
      access_token: accessToken ? accessToken : user.accessToken,
      fields: ""
    })

    const response = await this.get(`${edge}?${query}`)

    if (!response.id)
      throw new Error(
        "Facebook account ID request failure with token " + accessToken
      )

    return response
  }

  async getAdAccounts() {
    verifyAuth(this.context, 2)
    const { user } = this.context

    const edge = "me"
    const query = qs.stringify({
      access_token: user.accessToken,
      fields: "adaccounts{account_id}"
    })

    const response = await this.get(`${edge}?${query}`)

    const results = Array.isArray(response.adaccounts.data)
      ? Promise.all(
          response.adaccounts.data.map(account =>
            this.adAccountsReducer(account)
          )
        )
      : []

    console.log("Retrieved ad accounts\n", await results, "\n")

    return {
      results
    }
  }

  async adAccountsReducer({ id, account_id }) {
    return {
      id: account_id
    }
  }

  async getAdCreatives({ limit, after }) {
    verifyAuth(this.context, 2)

    const { user } = this.context
    let { accessToken, adAccountId } = user

    accessToken = process.env.OVERRIDE_ACCESS_TOKEN
      ? process.env.OVERRIDE_ACCESS_TOKEN
      : accessToken
    adAccountId = process.env.OVERRIDE_AD_ACCOUNT
      ? process.env.OVERRIDE_AD_ACCOUNT
      : adAccountId

    const edge = "adcreatives"
    const query = qs.stringify({
      access_token: accessToken,
      fields: "object_story_id,object_type,body,image_url,title",
      limit,
      after
    })

    const response = await this.get(`act_${adAccountId}/${edge}?${query}`)

    const results = Array.isArray(response.data)
      ? Promise.all(
          response.data.map(creative => this.adCreativesReducer(creative))
        )
      : []

    const hasMore =
      response.paging && !!response.paging.cursors.after ? true : false

    return {
      results,
      hasMore,
      after: response.paging && response.paging.cursors.after
    }
  }

  async adCreativesReducer(creative) {
    creative.image_url = creative.image_url ? creative.image_url : null
    creative.image_url =
      creative.image_url === null &&
      (creative.object_type === "PHOTO" || creative.object_type === "SHARE")
        ? await this.getPhotoObjectImageById(creative)
        : creative.image_url //todo: default image
    return creative
  }

  async getPhotoObjectImageById({ object_story_id }) {
    const { adAccountId, user } = this.context
    const { accessToken } = user

    const edge = object_story_id
    const query = qs.stringify({
      access_token: accessToken,
      fields: "full_picture"
    })
    const response = await this.get(`/${edge}?${query}`)
    // TODO: Implement default image if not found
    const image = !!response.full_picture ? response.full_picture : ""
    return image
  }
}

module.exports = FacebookAPI
