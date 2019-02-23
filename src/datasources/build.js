const { RESTDataSource } = require("apollo-datasource-rest")
const qs = require("qs")
const verifyAuth = require("../auth")

class BuildAPI extends RESTDataSource {
  constructor() {
    super()
    console.log("BUILD_HOOK_URL:", process.env.BUILD_HOOK_URL)
    this.baseURL = process.env.BUILD_HOOK_URL
  }

  async triggerBuild() {
    const response = await this.post("")
    console.log("\n\nTRIGGER BUILD RESPONSE", response)
    return true
  }
}

module.exports = BuildAPI
