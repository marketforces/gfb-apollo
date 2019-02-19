const { RESTDataSource } = require("apollo-datasource-rest")
const qs = require("qs")
const isAuthenticated = require("../auth")

const verifyAuth = ({ apiKey, authToken, adAccountId }, level) => {
  let result, code

  const isAuthed = isAuthenticated(apiKey) ? apiKey : false

  switch (level) {
    case 1:
      result = !!isAuthenticated
      code = "0001"
      break
    case 2:
      const level2Check = () => {
        const test = Buffer.from(`${adAccountId},${apiKey}`).toString("base64")
        return test === authToken
      }
      result = level2Check()
      code = "0002"
      break
  }

  console.log(
    "\nRoute Authentication\n",
    {
      result,
      apiKey,
      test: Buffer.from(`${adAccountId},${apiKey}`).toString("base64"),
      authToken,
      adAccountId,
      level
    },
    "\n"
  )
  if (result === false) {
    throw new Error("Authentication Failure Code: " + code)
  }
}

class FacebookAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = "https://graph.facebook.com/v3.2/"
    this.accessTokenParam = qs.stringify({
      access_token: process.env.ACCESS_TOKEN
    })
  }

  async getAccountById({ accountId }) {
    const { accessTokenParam } = this
    const response = await this.get(`act_${accountId}?${accessTokenParam}`)
    return this.accountReducer(response)
  }

  accountReducer({ id, account_id }) {
    return {
      id,
      account_id
    }
  }

  async getAdAccounts({ access_token }) {
    verifyAuth(this.context, 2)

    const edge = "me"
    const query = qs.stringify({
      access_token,
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

  async getAdCreatives({ id, limit, after }) {
    const edge = "adcreatives"
    const query = qs.stringify({
      access_token: process.env.ACCESS_TOKEN,
      fields: "object_story_id,object_type,body,image_url,title",
      limit,
      after
    })
    const response = await this.get(`act_${id}/${edge}?${query}`)
    // console.log("Res", response)
    const results = Array.isArray(response.data)
      ? Promise.all(
          response.data.map(creative => this.adCreativesReducer(creative))
        )
      : []
    return {
      results,
      hasMore: !!response.paging.cursors.after,
      after: response.paging.cursors.after
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
    const edge = object_story_id
    const query = qs.stringify({
      access_token: process.env.ACCESS_TOKEN,
      fields: "full_picture"
    })
    const response = await this.get(`/${edge}?${query}`)
    // TODO: Implement default image if not found
    const image = !!response.full_picture ? response.full_picture : ""
    return image
  }
}

module.exports = FacebookAPI
