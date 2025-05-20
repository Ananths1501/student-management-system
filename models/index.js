const { Sequelize } = require("sequelize")

// Get database connection parameters from environment variables
const DB_HOST = process.env.DB_HOST || "localhost"
const DB_USER = process.env.DB_USER || "root"
const DB_PASSWORD = process.env.DB_PASSWORD || "Praveen@16"
const DB_NAME = process.env.DB_NAME || "student_management"

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
})

sequelize
  .authenticate()
  .then(() => console.log("MySQL connected successfully."))
  .catch((err) => console.error("Connection error:", err))

module.exports = sequelize
