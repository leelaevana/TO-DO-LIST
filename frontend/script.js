const API_URL = "http://127.0.0.1:8000";

let currentFilter = "all";
let currentCategory = "";
let currentPriority = "";
let searchQuery = "";

// DOM Elements
const tasksContainer = document.getElementById("tasks-container");
const taskModal = document.getElementById("task-modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const taskForm = document.getElementById("task-form");
const modalTitle = document.getElementById("modal-title");
const taskIdInput = document.getElementById("task-id");
const taskTitleInput = document.getElementById("task-title");
const taskDescInput = document.getElementById("task-description");
const taskCategoryInput = document.getElementById("task-category");
const taskPriorityInput = document.getElementById("task-priority");
const taskDueDateInput = document.getElementById("task-due-date");
const searchInput = document.getElementById("search-input");
const filterPriority = document.getElementById("filter-priority");
const sectionTitle = document.getElementById("section-title");

// Stat elements
const statTotal = document.getElementById("stat-total");
const statCompleted = document.getElementById("stat-completed");
const statPending = document.getElementById("stat-pending");
const statPercentage = document.getElementById("stat-percentage");

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    fetchTasks();
    fetchStats();
});

// Modal Toggles
openModalBtn.addEventListener("click", () => {
    modalTitle.textContent = "Create New Task";
    taskForm.reset();
    taskIdInput.value = "";
    taskModal.classList.add("active");
});

closeModalBtn.addEventListener("click", () => {
    taskModal.classList.remove("active");
});

// Fetch & Render Tasks
async function fetchTasks() {
    let url = `${API_URL}/tasks?`;
    let params = new URLSearchParams();

    if (searchQuery) params.append("search", searchQuery);
    if (currentCategory) params.append("category", currentCategory);
    if (currentPriority) params.append("priority", currentPriority);
    
    if (currentFilter === "pending") params.append("status", "Pending");
    if (currentFilter === "completed") params.append("status", "Completed");

    try {
        const response = await fetch(url + params.toString());
        let tasks = await response.json();

        // Client-side filtering for 'today'
        if (currentFilter === "today") {
            const todayStr = new Date().toISOString().split("T")[0];
            tasks = tasks.filter(t => t.due_date === todayStr);
        }

        renderTasks(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

// Fetch Dashboard Stats
async function fetchStats() {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`);
        const stats = await response.json();
        
        statTotal.textContent = stats.total_tasks;
        statCompleted.textContent = stats.completed_tasks;
        statPending.textContent = stats.pending_tasks;
        statPercentage.textContent = `${stats.completion_percentage}%`;
    } catch (error) {
        console.error("Error fetching stats:", error);
    }
}

// Render Tasks to DOM
function renderTasks(tasks) {
    tasksContainer.innerHTML = "";
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No tasks found.</p>`;
        return;
    }

    tasks.forEach(task => {
        const isCompleted = task.status === "Completed";
        const card = document.createElement("div");
        card.className = `task-card ${isCompleted ? "completed" : ""}`;
        
        card.innerHTML = `
            <div class="task-header">
                <h4>${escapeHtml(task.title)}</h4>
                <div class="task-badges">
                    <span class="badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    <span class="badge category">${task.category}</span>
                </div>
            </div>
            <p>${escapeHtml(task.description || "No description provided.")}</p>
            <div class="task-footer">
                <span><i class="fa-regular fa-calendar"></i> ${task.due_date || "No due date"}</span>
                <div class="task-actions">
                    <button class="complete-btn" onclick="toggleComplete(${task.id})" title="Toggle Complete">
                        <i class="fa-solid ${isCompleted ? 'fa-rotate-left' : 'fa-check'}"></i>
                    </button>
                    <button class="edit-btn" onclick="openEditModal(${task.id})" title="Edit Task">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete Task">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        tasksContainer.appendChild(card);
    });
}

// Create or Update Task Form Submit
taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = taskIdInput.value;
    
    const taskData = {
        title: taskTitleInput.value,
        description: taskDescInput.value,
        category: taskCategoryInput.value,
        priority: taskPriorityInput.value,
        due_date: taskDueDateInput.value || null
    };

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/tasks/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            });
        } else {
            response = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            });
        }

        if (response.ok) {
            taskModal.classList.remove("active");
            fetchTasks();
            fetchStats();
        } else {
            alert("Failed to save task.");
        }
    } catch (error) {
        console.error("Error saving task:", error);
    }
});

// Toggle Complete Status
async function toggleComplete(id) {
    try {
        await fetch(`${API_URL}/tasks/${id}/complete`, { method: "PATCH" });
        fetchTasks();
        fetchStats();
    } catch (error) {
        console.error("Error completing task:", error);
    }
}

// Open Edit Modal
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`);
        const task = await response.json();

        modalTitle.textContent = "Edit Task";
        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskDescInput.value = task.description || "";
        taskCategoryInput.value = task.category;
        taskPriorityInput.value = task.priority;
        taskDueDateInput.value = task.due_date || "";

        taskModal.classList.add("active");
    } catch (error) {
        console.error("Error loading task for edit:", error);
    }
}

// Delete Task
async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
        await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
        fetchTasks();
        fetchStats();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

// Event Listeners for Filters & Search
document.querySelectorAll(".nav-links li").forEach(li => {
    li.addEventListener("click", (e) => {
        document.querySelectorAll(".nav-links li").forEach(el => el.classList.remove("active"));
        li.classList.add("active");
        currentFilter = li.getAttribute("data-filter");
        currentCategory = ""; // Reset category when switching main nav
        sectionTitle.textContent = li.textContent.trim();
        fetchTasks();
    });
});

document.querySelectorAll("#category-list li").forEach(li => {
    li.addEventListener("click", (e) => {
        currentCategory = li.getAttribute("data-category");
        currentFilter = "category";
        sectionTitle.textContent = `${currentCategory} Tasks`;
        fetchTasks();
    });
});

searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    fetchTasks();
});

filterPriority.addEventListener("change", (e) => {
    currentPriority = e.target.value;
    fetchTasks();
});

function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}