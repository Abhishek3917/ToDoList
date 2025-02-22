
const taskInput = document.getElementById("new-task");
const taskList = document.getElementById("task-list");
const addTaskButton = document.getElementById("add-task");
const themeToggle = document.getElementById("theme-toggle");

chrome.storage.local.get("theme", (data) => {
  if (data.theme === "light") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "🌙 ";
  } else {
    themeToggle.textContent = "☀️ ";
  }
});


themeToggle.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("dark-mode");
  chrome.storage.local.set({ theme: isLightMode ? "light" : "dark" });

  themeToggle.textContent = isLightMode ? "☀️ " : "🌙 ";
});

let db;
const request = indexedDB.open("todoDB",1)

request.onupgradeneeded = function(event){
  db = event.target.result;
  if(!db.objectStoreNames.contains("tasks")){
    db.createObjectStore("tasks",{keyPath: "id",autoIncrement:true });
  }
};

request.onsuccess = function(event) {
  db = event.target.result;
  loadTask(); 
};
request.onerror = function(event){
  console.log("ERROR OPENING DATABASE");
  
}

addTaskButton.addEventListener("click", ()=>{
  const taskTest = taskInput.value.trim();
  if(taskTest){
    const currDate= new Date().toLocaleDateString("en-us",{
      year:"numeric",
      month:"2-digit",
      day:"2-digit",
    });

    const newTask = {text:taskTest, done:false, date:currDate};

    const transaction = db.transaction(["tasks"],"readwrite");
    const store = transaction.objectStore("tasks")
    store.add(newTask);

    transaction.oncomplete =()=>{
      taskInput.value="";
      loadTask();
    };

  }
});



function loadTask(){
  taskList.innerHTML= "";
  const transaction =db.transaction(["tasks"],"readonly");
  const store = transaction.objectStore("tasks")
  const request = store.getAll();

  request.onsuccess = function (){
    request.result.forEach((task)=>{
      const li = document.createElement("li");
      li.innerHTML=`
      <span class = "${task.done ? "done": ""}">${task.text}</span>
      <small>${task.date}</small>
      <button class="remove" data-id="${task.id}">X</button>
      `;
      li.querySelector(".remove").addEventListener("click",()=>removeTask(task.id));
      li.querySelector("span").addEventListener("click", ()=> toggleTask(task.id));
      taskList.appendChild(li);
    });
  };

function toggleTask(id){

  const transaction= db.transaction(['tasks'],"readwrite");
  const store = transaction.objectStore("tasks");
  const request = store.get(id);

  request.onsuccess= function (){
    const task=request.result;
    task.done = !task.done;
    store.put(task);
    loadTask();
  };

}

function removeTask(id){
  const transaction= db.transaction(['tasks'],"readwrite");
  const store = transaction.objectStore("tasks");
  store.delete(id);
  transaction.oncomplete=()=>loadTask();
}

}