const isAuthenticated = (apiKey, requestKey) => {
  const acceptable = process.env.API_KEYS.split(",")
  const isAuthenticated = acceptable.includes(apiKey) && apiKey === requestKey
  return isAuthenticated
}

const verifyAuth = (
  { user, apiKey, requestKey, authToken, fbAccountId },
  level
) => {
  let result, code

  const fbAccessToken = user.accessToken
  if (!fbAccessToken) {
    console.log("User", user)
    throw new Error("Facebook access token not provided with request.")
  }

  const isAuthed = isAuthenticated(apiKey, requestKey) ? apiKey : false

  switch (level) {
    case 1:
      result = !!isAuthed
      code = "0001"
      break
    case 2:
      const level2Check = () => {
        const test = Buffer.from(`${fbAccountId},${apiKey}`).toString("base64")
        return !!isAuthed && test === authToken
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
      requestKey,
      test: Buffer.from(`${fbAccountId},${apiKey}`).toString("base64"),
      authToken,
      fbAccountId,
      level
    },
    "\n"
  )
  if (result === false) {
    throw new Error("Authentication Failure Code: " + code)
  }
}

module.exports = verifyAuth
