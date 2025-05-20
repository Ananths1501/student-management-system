const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Student = sequelize.define("Student", {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  gender: { type: DataTypes.ENUM("Male", "Female", "Other"), allowNull: false },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false },
  course: { type: DataTypes.STRING, allowNull: false },
  enrollmentDate: { type: DataTypes.DATEONLY, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
}, {
  timestamps: true,
});

sequelize.sync();

module.exports = Student;
