const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const bodyParser = require("body-parser")

// Create Express app
const app = express()
const PORT = process.env.PORT || 7373

// Middleware
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, "public")))

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/student_management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Student Schema
const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
  dateOfBirth: { type: Date, required: true },
  course: { type: String, required: true },
  enrollmentDate: { type: Date, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const Student = mongoose.model("Student", studentSchema)

// API Routes

// Get dashboard data
app.get("/api/dashboard", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments()
    const maleStudents = await Student.countDocuments({ gender: "Male" })
    const femaleStudents = await Student.countDocuments({ gender: "Female" })
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5)

    res.json({
      totalStudents,
      maleStudents,
      femaleStudents,
      recentStudents,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all students with pagination and filtering
app.get("/api/students", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter
    const filter = {}

    if (req.query.name) {
      const nameRegex = new RegExp(req.query.name, "i")
      filter.$or = [{ firstName: nameRegex }, { lastName: nameRegex }]
    }

    if (req.query.course) {
      filter.course = req.query.course
    }

    if (req.query.gender) {
      filter.gender = req.query.gender
    }

    const total = await Student.countDocuments(filter)
    const students = await Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)

    res.json({
      students,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a single student
app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.json(student)
  } catch (error) {
    console.error("Error fetching student:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new student
app.post("/api/students", async (req, res) => {
  try {
    const newStudent = new Student(req.body)
    const savedStudent = await newStudent.save()
    res.status(201).json(savedStudent)
  } catch (error) {
    console.error("Error creating student:", error)

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// Update a student
app.put("/api/students/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.json(updatedStudent)
  } catch (error) {
    console.error("Error updating student:", error)

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" })
    }

    res.status(500).json({ message: "Server error" })
  }
})

// Delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id)

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Error deleting student:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Serve the main HTML file for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
