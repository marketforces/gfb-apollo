const isAuthenticated = apiKey => {
  const acceptable = process.env.API_KEYS.split(",")
  const isAuthenticated = acceptable.includes(apiKey)
  return isAuthenticated
}

module.exports = isAuthenticated
