const form = document.getElementById("assignment-form");
const titleInput = document.getElementById("title");
const moduleInput = document.getElementById("module");
const dueDateInput = document.getElementById("due-date");
const assignmentList = document.getElementById("assignment-list");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const pendingCount = document.getElementById("pending-count");

let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
let currentFilter = "all";
let editingId = null;

function saveAssignments() {
  localStorage.setItem("assignments", JSON.stringify(assignments));
}

function updateStats() {
  totalCount.textContent = assignments.length;
  completedCount.textContent = assignments.filter(a => a.completed).length;
  pendingCount.textContent = assignments.filter(a => !a.completed).length;
}

function isOverdue(dueDate, completed) {
  if (completed) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

function renderAssignments() {
  assignmentList.innerHTML = "";

  let filtered = assignments;

  if (currentFilter === "pending") {
    filtered = assignments.filter(a => !a.completed);
  } else if (currentFilter === "completed") {
    filtered = assignments.filter(a => a.completed);
  }

  if (filtered.length === 0) {
    assignmentList.innerHTML = `<li><p>No assignments found.</p></li>`;
    updateStats();
    return;
  }

  filtered.forEach(assignment => {
    const li = document.createElement("li");
    if (assignment.completed) li.classList.add("completed");

    const overdueMessage = isOverdue(assignment.dueDate, assignment.completed)
      ? `<p class="overdue"><strong>Overdue</strong></p>`
      : "";

    li.innerHTML = `
      <h3>${assignment.title}</h3>
      <p><strong>Module:</strong> ${assignment.module}</p>
      <p><strong>Due:</strong> ${assignment.dueDate}</p>
      <p><strong>Status:</strong> ${assignment.completed ? "Completed" : "Pending"}</p>
      ${overdueMessage}
      <div class="actions">
        <button onclick="toggleComplete(${assignment.id})">
          ${assignment.completed ? "Undo" : "Complete"}
        </button>
        <button onclick="editAssignment(${assignment.id})">Edit</button>
        <button onclick="deleteAssignment(${assignment.id})">Delete</button>
      </div>
    `;

    assignmentList.appendChild(li);
  });

  updateStats();
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const module = moduleInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!title || !module || !dueDate) {
    alert("Please fill in all fields.");
    return;
  }

  if (editingId) {
    assignments = assignments.map(a =>
      a.id === editingId
        ? { ...a, title, module, dueDate }
        : a
    );
    editingId = null;
  } else {
    assignments.push({
      id: Date.now(),
      title,
      module,
      dueDate,
      completed: false
    });
  }

  saveAssignments();
  renderAssignments();
  form.reset();
});

function deleteAssignment(id) {
  const confirmDelete = confirm("Are you sure you want to delete this assignment?");
  if (!confirmDelete) return;

  assignments = assignments.filter(a => a.id !== id);
  saveAssignments();
  renderAssignments();
}

function toggleComplete(id) {
  assignments = assignments.map(a =>
    a.id === id ? { ...a, completed: !a.completed } : a
  );
  saveAssignments();
  renderAssignments();
}

function editAssignment(id) {
  const assignment = assignments.find(a => a.id === id);
  if (!assignment) return;

  titleInput.value = assignment.title;
  moduleInput.value = assignment.module;
  dueDateInput.value = assignment.dueDate;
  editingId = id;
}

function setFilter(filter) {
  currentFilter = filter;
  renderAssignments();
}

renderAssignments();