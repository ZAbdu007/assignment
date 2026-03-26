const form = document.getElementById("assignment-form");
const titleInput = document.getElementById("title");
const moduleInput = document.getElementById("module");
const dueDateInput = document.getElementById("due-date");
const assignmentList = document.getElementById("assignment-list");

let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
let currentFilter = "all";
let editingId = null;

function saveAssignments() {
  localStorage.setItem("assignments", JSON.stringify(assignments));
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
    return;
  }

  filtered.forEach(assignment => {
    const li = document.createElement("li");
    if (assignment.completed) li.classList.add("completed");

    li.innerHTML = `
      <h3>${assignment.title}</h3>
      <p><strong>Module:</strong> ${assignment.module}</p>
      <p><strong>Due:</strong> ${assignment.dueDate}</p>
      <p><strong>Status:</strong> ${assignment.completed ? "Completed" : "Pending"}</p>
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
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const module = moduleInput.value.trim();
  const dueDate = dueDateInput.value;

  if (!title || !module || !dueDate) return;

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