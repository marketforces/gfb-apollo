const qs = require("qs")
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

    // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: false
  }
)

const sync = () => {
  sequelize
    .sync()
    .then(() => {
      console.log("Database successfully synced.")
    })
    .catch(err => {
      console.log("Error: DB Sync Failure", err)
    })
}

const test = () => {
  sequelize
    .sync({ force: true })
    .then(() =>
      User.create({
        AccessToken: "",
        ApiKey: Date.now(),
        AdAccountId: "",
        FbUserId: ""
      })
    )
    .then(testuser => {
      // console.log(testuser.toJSON())
      console.log("Test USER CREATED")
    })
    .catch(e => {
      console.log("DB ERROR:", e)
    })
}

// console.log(sequelize)

module.exports.createStore = () => {
  const Op = sequelize.Op
  const operatorsAliases = {
    $in: Op.in
  }

  const user = sequelize.define("user", {
    AccessToken: Sequelize.STRING,
    ApiKey: Sequelize.STRING,
    AdAccountId: Sequelize.STRING,
    FbUserId: Sequelize.STRING
  })

  sequelize
    .authenticate()
    .then(() => {
      console.log(
        `Database connection has been established successfully to ${
          process.env.DB_NAME
        } with user ${process.env.DB_USERNAME.substring(0, 5)}******.`
      )
      sync()
    })
    .catch(err => {
      console.error("Unable to connect to the database:", err)
    })

  return user
}
