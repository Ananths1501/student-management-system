document.addEventListener("DOMContentLoaded", () => {
  // Navigation
  const dashboardLink = document.getElementById("dashboard-link")
  const addStudentLink = document.getElementById("add-student-link")
  const manageStudentsLink = document.getElementById("manage-students-link")

  const dashboardSection = document.getElementById("dashboard")
  const addStudentSection = document.getElementById("add-student")
  const manageStudentsSection = document.getElementById("manage-students")

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
    dashboardSection.classList.add("d-none")
    dashboardSection.classList.remove("section-active")
    addStudentSection.classList.add("d-none")
    addStudentSection.classList.remove("section-active")
    manageStudentsSection.classList.add("d-none")
    manageStudentsSection.classList.remove("section-active")
    section.classList.remove("d-none")
    section.classList.add("section-active")
  }

  function updateActiveLink(activeLink) {
    dashboardLink.classList.remove("active")
    addStudentLink.classList.remove("active")
    manageStudentsLink.classList.remove("active")
    activeLink.classList.add("active")
  }

  const addStudentForm = document.getElementById("add-student-form")
  addStudentForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const formData = new FormData(addStudentForm)
    const studentData = {}
    formData.forEach((value, key) => {
      studentData[key] = value
    })

    fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Student added successfully!")
        addStudentForm.reset()
        showSection(manageStudentsSection)
        updateActiveLink(manageStudentsLink)
        loadStudents()
      })
      .catch((err) => {
        console.error("Error:", err)
        alert("Error adding student. Please try again.")
      })
  })

  function loadDashboardData() {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        document.getElementById("total-students").textContent = data.totalStudents
        document.getElementById("male-students").textContent = data.maleStudents
        document.getElementById("female-students").textContent = data.femaleStudents

        const recentTable = document.getElementById("recent-students-table").querySelector("tbody")
        recentTable.innerHTML = ""
        data.recentStudents.forEach((student) => {
          const row = document.createElement("tr")
          row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>${new Date(student.enrollmentDate).toLocaleDateString()}</td>
          `
          recentTable.appendChild(row)
        })
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
  }

  let currentPage = 1
  const pageSize = 10
  let totalStudents = 0
  let filteredStudents = []

  function loadStudents(page = 1, filters = {}) {
    currentPage = page
    const params = new URLSearchParams({ page, limit: pageSize })
    if (filters.name) params.append("name", filters.name)
    if (filters.course) params.append("course", filters.course)
    if (filters.gender) params.append("gender", filters.gender)

    fetch(`/api/students?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        filteredStudents = data.students
        totalStudents = data.total

        const tbody = document.getElementById("students-table").querySelector("tbody")
        tbody.innerHTML = ""

        if (filteredStudents.length === 0) {
          tbody.innerHTML = `<tr><td colspan="7" class="text-center">No students found</td></tr>`
        } else {
          filteredStudents.forEach((student) => {
            const row = document.createElement("tr")
            row.innerHTML = `
              <td>${student.id}</td>
              <td>${student.firstName} ${student.lastName}</td>
              <td>${student.email}</td>
              <td>${student.phone}</td>
              <td>${student.gender}</td>
              <td>${student.course}</td>
              <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${student.id}">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn ms-1" data-id="${student.id}">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </td>
            `
            tbody.appendChild(row)
          })

          document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", () => openEditModal(btn.dataset.id))
          })

          document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", () => openDeleteModal(btn.dataset.id))
          })
        }

        const start = (page - 1) * pageSize + 1
        const end = Math.min(page * pageSize, totalStudents)
        document.getElementById("showing-entries").textContent = `Showing ${start} to ${end} of ${totalStudents} entries`
        generatePagination(totalStudents, page)
      })
      .catch((err) => console.error("Error loading students:", err))
  }

  function generatePagination(total, currentPage) {
    const totalPages = Math.ceil(total / pageSize)
    const pagination = document.getElementById("pagination")
    pagination.innerHTML = ""

    const createPageItem = (label, disabled = false, active = false) => {
      const li = document.createElement("li")
      li.className = `page-item${disabled ? " disabled" : ""}${active ? " active" : ""}`
      li.innerHTML = `<a class="page-link" href="#">${label}</a>`
      return li
    }

    const prev = createPageItem("«", currentPage === 1)
    if (currentPage > 1) prev.addEventListener("click", () => loadStudents(currentPage - 1, getFilters()))
    pagination.appendChild(prev)

    const maxPages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2))
    let endPage = Math.min(totalPages, startPage + maxPages - 1)

    if (endPage - startPage < maxPages - 1) startPage = Math.max(1, endPage - maxPages + 1)

    for (let i = startPage; i <= endPage; i++) {
      const page = createPageItem(i, false, i === currentPage)
      page.addEventListener("click", () => loadStudents(i, getFilters()))
      pagination.appendChild(page)
    }

    const next = createPageItem("»", currentPage === totalPages)
    if (currentPage < totalPages) next.addEventListener("click", () => loadStudents(currentPage + 1, getFilters()))
    pagination.appendChild(next)
  }

  const applyFiltersBtn = document.getElementById("apply-filters")
  applyFiltersBtn.addEventListener("click", () => loadStudents(1, getFilters()))

  function getFilters() {
    return {
      name: document.getElementById("search-name").value,
      course: document.getElementById("filter-course").value,
      gender: document.getElementById("filter-gender").value,
    }
  }

  function openEditModal(studentId) {
    fetch(`/api/students/${studentId}`)
      .then((res) => res.json())
      .then((student) => {
        document.getElementById("edit-student-id").value = student.id
        document.getElementById("edit-firstName").value = student.firstName
        document.getElementById("edit-lastName").value = student.lastName
        document.getElementById("edit-email").value = student.email
        document.getElementById("edit-phone").value = student.phone
        document.getElementById("edit-gender").value = student.gender
        document.getElementById("edit-dateOfBirth").value = student.dateOfBirth
        document.getElementById("edit-course").value = student.course
        document.getElementById("edit-enrollmentDate").value = student.enrollmentDate
        document.getElementById("edit-address").value = student.address

        const modal = new bootstrap.Modal(document.getElementById("editStudentModal"))
        modal.show()
      })
  }

  document.getElementById("save-edit-button").addEventListener("click", () => {
    const studentId = document.getElementById("edit-student-id").value
    const formData = new FormData(document.getElementById("edit-student-form"))
    const studentData = {}
    formData.forEach((value, key) => {
      studentData[key] = value
    })

    fetch(`/api/students/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Student updated successfully!")
        bootstrap.Modal.getInstance(document.getElementById("editStudentModal")).hide()
        loadStudents(currentPage, getFilters())
        if (dashboardSection.classList.contains("section-active")) loadDashboardData()
      })
  })

  function openDeleteModal(studentId) {
    const student = filteredStudents.find((s) => s.id == studentId)
    if (student) {
      document.getElementById("delete-student-id").value = student.id
      document.getElementById("delete-student-name").textContent = `${student.firstName} ${student.lastName}`
      const modal = new bootstrap.Modal(document.getElementById("deleteStudentModal"))
      modal.show()
    }
  }

  document.getElementById("confirm-delete-button").addEventListener("click", () => {
    const studentId = document.getElementById("delete-student-id").value
    fetch(`/api/students/${studentId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        alert("Student deleted successfully!")
        bootstrap.Modal.getInstance(document.getElementById("deleteStudentModal")).hide()
        loadStudents(currentPage, getFilters())
        if (dashboardSection.classList.contains("section-active")) loadDashboardData()
      })
  })

  // Load dashboard on first load
  loadDashboardData()
})
