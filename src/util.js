const Sequelize = require("sequelize")

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    operatorsAliases: false
  }
)

const createStore = () => {
  const Op = sequelize.Op

  const operatorsAliases = {
    $in: Op.in
  }

  const users = sequelize.define("user", {
    accessToken: Sequelize.STRING,
    apiKey: Sequelize.STRING,
    adAccountId: Sequelize.STRING,
    fbUserId: Sequelize.STRING
  })

  sequelize
    .authenticate()
    .then(() => {
      console.log(
        ` Database connection has been established
 successfully to ${process.env.DB_NAME} with
 user ${process.env.DB_USERNAME.substring(0, 5)}******.`
      )

      sequelize.sync({ force: true }).then(() => {
        users.create({
          apiKey: Date.now()
        })
      })
    })
    .catch(err => {
      console.error("Unable to connect to the database:", err)
    })

  return { users }
}

// createStore()

module.exports = createStore
