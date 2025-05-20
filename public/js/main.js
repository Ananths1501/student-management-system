document.addEventListener("DOMContentLoaded", () => {
  // Navigation
  const dashboardLink = document.getElementById("dashboard-link")
  const addStudentLink = document.getElementById("add-student-link")
  const manageStudentsLink = document.getElementById("manage-students-link")

  const dashboardSection = document.getElementById("dashboard")
  const addStudentSection = document.getElementById("add-student")
  const manageStudentsSection = document.getElementById("manage-students")

  // Navigation functionality
  dashboardLink.addEventListener("click", (e) => {
    e.preventDefault()
    showSection(dashboardSection)
    updateActiveLink(dashboardLink)
    loadDashboardData()
  })

  addStudentLink.addEventListener("click", (e) => {
    e.preventDefault()
    showSection(addStudentSection)
    updateActiveLink(addStudentLink)
  })

  manageStudentsLink.addEventListener("click", (e) => {
    e.preventDefault()
    showSection(manageStudentsSection)
    updateActiveLink(manageStudentsLink)
    loadStudents()
  })

  function showSection(section) {
    // Hide all sections
    dashboardSection.classList.add("d-none")
    dashboardSection.classList.remove("section-active")

    addStudentSection.classList.add("d-none")
    addStudentSection.classList.remove("section-active")

    manageStudentsSection.classList.add("d-none")
    manageStudentsSection.classList.remove("section-active")

    // Show the selected section
    section.classList.remove("d-none")
    section.classList.add("section-active")
  }

  function updateActiveLink(activeLink) {
    // Remove active class from all links
    dashboardLink.classList.remove("active")
    addStudentLink.classList.remove("active")
    manageStudentsLink.classList.remove("active")

    // Add active class to the clicked link
    activeLink.classList.add("active")
  }

  // Add Student Form Submission
  const addStudentForm = document.getElementById("add-student-form")

  addStudentForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const formData = new FormData(addStudentForm)
    const studentData = {}

    formData.forEach((value, key) => {
      studentData[key] = value
    })

    // Send data to server
    fetch("/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        // Show success message
        alert("Student added successfully!")
        addStudentForm.reset()

        // Navigate to manage students
        showSection(manageStudentsSection)
        updateActiveLink(manageStudentsLink)
        loadStudents()
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("Error adding student. Please try again.")
      })
  })

  // Load Dashboard Data
  function loadDashboardData() {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("total-students").textContent = data.totalStudents
        document.getElementById("male-students").textContent = data.maleStudents
        document.getElementById("female-students").textContent = data.femaleStudents

        // Load recent students
        const recentStudentsTable = document.getElementById("recent-students-table").getElementsByTagName("tbody")[0]
        recentStudentsTable.innerHTML = ""

        data.recentStudents.forEach((student) => {
          const row = document.createElement("tr")
          row.innerHTML = `
            <td>${student._id.substring(0, 8)}...</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>${new Date(student.enrollmentDate).toLocaleDateString()}</td>
          `
          recentStudentsTable.appendChild(row)
        })
      })
      .catch((error) => {
        console.error("Error loading dashboard data:", error)
      })
  }

  // Load Students for Manage Students Section
  let currentPage = 1
  const pageSize = 10
  let totalStudents = 0
  let filteredStudents = []

  function loadStudents(page = 1, filters = {}) {
    currentPage = page

    // Construct query parameters
    const queryParams = new URLSearchParams()
    queryParams.append("page", page)
    queryParams.append("limit", pageSize)

    if (filters.name) queryParams.append("name", filters.name)
    if (filters.course) queryParams.append("course", filters.course)
    if (filters.gender) queryParams.append("gender", filters.gender)

    fetch(`/api/students?${queryParams.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        filteredStudents = data.students
        totalStudents = data.total

        const studentsTable = document.getElementById("students-table").getElementsByTagName("tbody")[0]
        studentsTable.innerHTML = ""

        if (filteredStudents.length === 0) {
          const row = document.createElement("tr")
          row.innerHTML = `<td colspan="7" class="text-center">No students found</td>`
          studentsTable.appendChild(row)
        } else {
          filteredStudents.forEach((student) => {
            const row = document.createElement("tr")
            row.innerHTML = `
              <td>${student._id.substring(0, 8)}...</td>
              <td>${student.firstName} ${student.lastName}</td>
              <td>${student.email}</td>
              <td>${student.phone}</td>
              <td>${student.gender}</td>
              <td>${student.course}</td>
              <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${student._id}">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn ms-1" data-id="${student._id}">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            `
            studentsTable.appendChild(row)
          })

          // Add event listeners to edit and delete buttons
          document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
              const studentId = this.getAttribute("data-id")
              openEditModal(studentId)
            })
          })

          document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
              const studentId = this.getAttribute("data-id")
              openDeleteModal(studentId)
            })
          })
        }

        // Update showing entries text
        const start = (page - 1) * pageSize + 1
        const end = Math.min(page * pageSize, totalStudents)
        document.getElementById("showing-entries").textContent =
          `Showing ${start} to ${end} of ${totalStudents} entries`

        // Generate pagination
        generatePagination(totalStudents, page)
      })
      .catch((error) => {
        console.error("Error loading students:", error)
      })
  }

  // Generate pagination
  function generatePagination(total, currentPage) {
    const totalPages = Math.ceil(total / pageSize)
    const pagination = document.getElementById("pagination")
    pagination.innerHTML = ""

    // Previous button
    const prevLi = document.createElement("li")
    prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous">
                          <span aria-hidden="true">&laquo;</span>
                        </a>`
    pagination.appendChild(prevLi)

    if (currentPage > 1) {
      prevLi.addEventListener("click", (e) => {
        e.preventDefault()
        loadStudents(currentPage - 1, getFilters())
      })
    }

    // Page numbers
    const maxPages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2))
    const endPage = Math.min(totalPages, startPage + maxPages - 1)

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageLi = document.createElement("li")
      pageLi.className = `page-item ${i === currentPage ? "active" : ""}`
      pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`
      pagination.appendChild(pageLi)

      pageLi.addEventListener("click", (e) => {
        e.preventDefault()
        loadStudents(i, getFilters())
      })
    }

    // Next button
    const nextLi = document.createElement("li")
    nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next">
                          <span aria-hidden="true">&raquo;</span>
                        </a>`
    pagination.appendChild(nextLi)

    if (currentPage < totalPages) {
      nextLi.addEventListener("click", (e) => {
        e.preventDefault()
        loadStudents(currentPage + 1, getFilters())
      })
    }
  }

  // Filter functionality
  const applyFiltersBtn = document.getElementById("apply-filters")

  applyFiltersBtn.addEventListener("click", () => {
    loadStudents(1, getFilters())
  })

  function getFilters() {
    return {
      name: document.getElementById("search-name").value,
      course: document.getElementById("filter-course").value,
      gender: document.getElementById("filter-gender").value,
    }
  }

  // Edit Student Modal
  function openEditModal(studentId) {
    fetch(`/api/students/${studentId}`)
      .then((response) => response.json())
      .then((student) => {
        document.getElementById("edit-student-id").value = student._id
        document.getElementById("edit-firstName").value = student.firstName
        document.getElementById("edit-lastName").value = student.lastName
        document.getElementById("edit-email").value = student.email
        document.getElementById("edit-phone").value = student.phone
        document.getElementById("edit-gender").value = student.gender
        document.getElementById("edit-dateOfBirth").value = student.dateOfBirth.split("T")[0]
        document.getElementById("edit-course").value = student.course
        document.getElementById("edit-enrollmentDate").value = student.enrollmentDate.split("T")[0]
        document.getElementById("edit-address").value = student.address

        // Show the modal
        const editModal = new bootstrap.Modal(document.getElementById("editStudentModal"))
        editModal.show()
      })
      .catch((error) => {
        console.error("Error fetching student details:", error)
      })
  }

  // Save edited student
  document.getElementById("save-edit-button").addEventListener("click", () => {
    const studentId = document.getElementById("edit-student-id").value
    const formData = new FormData(document.getElementById("edit-student-form"))
    const studentData = {}

    formData.forEach((value, key) => {
      studentData[key] = value
    })

    fetch(`/api/students/${studentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        // Close the modal
        const editModalElement = document.getElementById("editStudentModal")
        const editModal = bootstrap.Modal.getInstance(editModalElement)
        editModal.hide()

        // Show success message
        alert("Student updated successfully!")

        // Reload students
        loadStudents(currentPage, getFilters())

        // If on dashboard, reload dashboard data
        if (dashboardSection.classList.contains("section-active")) {
          loadDashboardData()
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("Error updating student. Please try again.")
      })
  })

  // Delete Student Modal
  function openDeleteModal(studentId) {
    const student = filteredStudents.find((s) => s._id === studentId)

    if (student) {
      document.getElementById("delete-student-id").value = studentId
      document.getElementById("delete-student-name").textContent = `${student.firstName} ${student.lastName}`

      // Show the modal
      const deleteModal = new bootstrap.Modal(document.getElementById("deleteStudentModal"))
      deleteModal.show()
    }
  }

  // Confirm delete student
  document.getElementById("confirm-delete-button").addEventListener("click", () => {
    const studentId = document.getElementById("delete-student-id").value

    fetch(`/api/students/${studentId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        // Close the modal
        const deleteModalElement = document.getElementById("deleteStudentModal")
        const deleteModal = bootstrap.Modal.getInstance(deleteModalElement)
        deleteModal.hide()

        // Show success message
        alert("Student deleted successfully!")

        // Reload students
        loadStudents(currentPage, getFilters())

        // If on dashboard, reload dashboard data
        if (dashboardSection.classList.contains("section-active")) {
          loadDashboardData()
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("Error deleting student. Please try again.")
      })
  })

  // Load dashboard data on initial load
  loadDashboardData()
})
