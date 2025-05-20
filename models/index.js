const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("student_management", "root", "Praveen@16", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log("MySQL connected successfully."))
  .catch((err) => console.error("Connection error:", err));

module.exports = sequelize;
