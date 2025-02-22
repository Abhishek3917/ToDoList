
const taskInput = document.getElementById("new-task");
const taskList = document.getElementById("task-list");
const addTaskButton = document.getElementById("add-task");

const themeToggle = document.getElementById("theme-toggle");

// Load theme from storage
chrome.storage.local.get("theme", (data) => {
  if (data.theme === "light") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "🌙 ";
  } else {
    themeToggle.textContent = "☀️ ";
  }
});

// Toggle theme
themeToggle.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("dark-mode");
  chrome.storage.local.set({ theme: isLightMode ? "light" : "dark" });

  themeToggle.textContent = isLightMode ? "☀️ " : "🌙 ";
});

let tasks = [];


chrome.storage.local.get("tasks", (data) => {
  if (data.tasks) {
    tasks = data.tasks;
    renderTasks();
}}
);


addTaskButton.addEventListener("click", () => {
  const task = taskInput.value.trim();
  if (task) {
    tasks.push({ text: task, done: false });
    saveTasks();
    taskInput.value = "";
    renderTasks();
  }
});


function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="${task.done ? "done" : ""}">${task.text}</span>
      <button class="remove" data-index="${index}">X</button>
    `;
    li.querySelector(".remove").addEventListener("click", () => removeTask(index));
    li.querySelector("span").addEventListener("click", () => toggleTask(index));
    taskList.appendChild(li);
  });
}


function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
}


function removeTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}


function saveTasks() {
  chrome.storage.local.set({ tasks });
}
