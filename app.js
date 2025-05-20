const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")

const sequelize = require("./models/index")
const Student = require("./models/student.model")
const { Op } = require("sequelize")

const app = express()
const PORT = process.env.PORT || 7373

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "public")))

// Dashboard Route
app.get("/api/dashboard", async (req, res) => {
  try {
    const totalStudents = await Student.count()
    const maleStudents = await Student.count({ where: { gender: "Male" } })
    const femaleStudents = await Student.count({ where: { gender: "Female" } })
    const recentStudents = await Student.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
    })

    res.json({ totalStudents, maleStudents, femaleStudents, recentStudents })
  } catch (err) {
    console.error("Error fetching dashboard:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all students with filters and pagination
app.get("/api/students", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const where = {}
    if (req.query.name) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${req.query.name}%` } },
        { lastName: { [Op.like]: `%${req.query.name}%` } },
      ]
    }
    if (req.query.course) where.course = req.query.course
    if (req.query.gender) where.gender = req.query.gender

    const { count, rows } = await Student.findAndCountAll({
      where,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    })

    res.json({
      students: rows,
      total: count,
      page,
      pages: Math.ceil(count / limit),
    })
  } catch (err) {
    console.error("Error fetching students:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single student
app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id)
    if (!student) return res.status(404).json({ message: "Student not found" })
    res.json(student)
  } catch (err) {
    console.error("Error fetching student:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Create student
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body)
    res.status(201).json(student)
  } catch (err) {
    console.error("Error creating student:", err)
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email already exists" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// Update student
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id)
    if (!student) return res.status(404).json({ message: "Student not found" })

    await student.update(req.body)
    res.json(student)
  } catch (err) {
    console.error("Error updating student:", err)
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email already exists" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// Delete student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id)
    if (!student) return res.status(404).json({ message: "Student not found" })

    await student.destroy()
    res.json({ message: "Student deleted successfully" })
  } catch (err) {
    console.error("Error deleting student:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
