let todoItemsContainer = document.getElementById("todoItemsContainer");
let addTodoButton = document.getElementById("addTodoButton");
let saveTodoButton = document.getElementById("saveTodoButton");
let searchInput = document.getElementById("searchInput");
let filterPriority = document.getElementById("filterPriority");
let sortBy = document.getElementById("sortBy");

// Theme toggle functionality
const themeToggle = document.getElementById("themeToggle");
const htmlElement = document.documentElement;
const moonIcon = '<i class="fas fa-moon"></i>';
const sunIcon = '<i class="fas fa-sun"></i>';

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
htmlElement.setAttribute("data-theme", savedTheme);
themeToggle.innerHTML = savedTheme === "dark" ? sunIcon : moonIcon;

// Theme toggle with transition effect
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Add transition class
  body.classList.add('theme-transition');
  
  // Set new theme after a small delay to allow animation to start
  setTimeout(() => {
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }, 50);
  
  // Remove transition class after animation completes
  setTimeout(() => {
    body.classList.remove('theme-transition');
  }, 500);
}

// Add click event listener to theme toggle button
themeToggle.addEventListener('click', toggleTheme);

function getTodoListFromLocalStorage() {
  let stringifiedTodoList = localStorage.getItem("todoList");
  let parsedTodoList = JSON.parse(stringifiedTodoList);
  if (parsedTodoList === null) {
    return [];
  } else {
    return parsedTodoList;
  }
}

let todoList = getTodoListFromLocalStorage();
let todosCount = todoList.length;

saveTodoButton.onclick = function() {
  localStorage.setItem("todoList", JSON.stringify(todoList));
};

function onAddTodo() {
  let userInputElement = document.getElementById("todoUserInput");
  let dueDateElement = document.getElementById("todoDueDate");
  let priorityElement = document.getElementById("todoPriority");
  let categoryElement = document.getElementById("todoCategory");

  let userInputValue = userInputElement.value;
  let dueDate = dueDateElement.value;
  let priority = priorityElement.value;
  let category = categoryElement.value;

  if (userInputValue === "") {
    alert("Enter Valid Text");
    return;
  }

  todosCount = todosCount + 1;

  let newTodo = {
    text: userInputValue,
    uniqueNo: todosCount,
    isChecked: false,
    dueDate: dueDate || "",
    priority: priority || "",
    category: category || ""
  };
  
  todoList.push(newTodo);
  createAndAppendTodo(newTodo);
  
  userInputElement.value = "";
  dueDateElement.value = "";
  priorityElement.value = "";
  categoryElement.value = "";
}

// Add event listener for the add button
addTodoButton.onclick = function() {
  onAddTodo();
};

function filterAndSortTodos() {
  // Clear existing todos
  todoItemsContainer.innerHTML = "";
  
  // Get filter values
  let searchTerm = searchInput.value.toLowerCase();
  let selectedPriority = filterPriority.value;
  let sortOption = sortBy.value;
  
  // Filter todos
  let filteredTodos = todoList.filter(todo => {
    let matchesSearch = todo.text.toLowerCase().includes(searchTerm) ||
                       (todo.category && todo.category.toLowerCase().includes(searchTerm));
    let matchesPriority = selectedPriority === "" || todo.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });
  
  // Sort todos
  filteredTodos.sort((a, b) => {
    switch(sortOption) {
      case "date":
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case "priority": {
        const priorityOrder = { high: 1, medium: 2, low: 3, "": 4 };
        return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      }
      case "category":
        if (!a.category && !b.category) return 0;
        if (!a.category) return 1;
        if (!b.category) return -1;
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });
  
  // Display filtered and sorted todos
  filteredTodos.forEach(todo => createAndAppendTodo(todo));
}

// Add event listeners for search, filter, and sort
searchInput.addEventListener("input", filterAndSortTodos);
filterPriority.addEventListener("change", filterAndSortTodos);
sortBy.addEventListener("change", filterAndSortTodos);

function updateProgress() {
  const totalTasks = todoList.length;
  const completedTasks = todoList.filter(todo => todo.isChecked).length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  document.getElementById('progressFill').style.width = `${progressPercentage}%`;
  document.getElementById('progressText').textContent = `${progressPercentage}%`;
  document.getElementById('completedTasks').textContent = `${completedTasks} completed`;
  document.getElementById('totalTasks').textContent = `${totalTasks} total`;

  // Show/hide empty state
  const emptyState = document.getElementById('emptyState');
  if (totalTasks === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }
}

function createAndAppendTodo(todo) {
  let todoId = "todo" + todo.uniqueNo;
  let checkboxId = "checkbox" + todo.uniqueNo;
  let labelId = "label" + todo.uniqueNo;

  let todoElement = document.createElement("li");
  todoElement.classList.add("todo-item-container");
  todoElement.id = todoId;

  let inputElement = document.createElement("input");
  inputElement.type = "checkbox";
  inputElement.id = checkboxId;
  inputElement.checked = todo.isChecked;
  inputElement.classList.add("checkbox-input");
  inputElement.onclick = function() {
    onTodoStatusChange(checkboxId, labelId, todoId);
  };

  let labelElement = document.createElement("label");
  labelElement.setAttribute("for", checkboxId);
  labelElement.id = labelId;
  labelElement.classList.add("checkbox-label");
  labelElement.textContent = todo.text;
  if (todo.isChecked) {
    labelElement.classList.add("checked");
  }

  let metaContainer = document.createElement("div");
  metaContainer.classList.add("todo-meta");

  // Add priority indicator
  if (todo.priority) {
    let priorityElement = document.createElement("span");
    priorityElement.classList.add("priority-indicator", `priority-${todo.priority}`);
    priorityElement.textContent = todo.priority.charAt(0).toUpperCase();
    metaContainer.appendChild(priorityElement);
  }

  // Add category with icon
  if (todo.category) {
    let categoryElement = document.createElement("span");
    categoryElement.classList.add("todo-category");
    categoryElement.innerHTML = `<i class="fas fa-tag"></i> ${todo.category}`;
    metaContainer.appendChild(categoryElement);
  }

  // Add due date with icon
  if (todo.dueDate) {
    let dueDateElement = document.createElement("span");
    dueDateElement.classList.add("todo-due-date");
    dueDateElement.innerHTML = `<i class="far fa-calendar-alt"></i> ${new Date(todo.dueDate).toLocaleDateString()}`;
    metaContainer.appendChild(dueDateElement);
  }

  // Add delete button
  let deleteButton = document.createElement("i");
  deleteButton.classList.add("fas", "fa-trash-alt", "delete-icon");
  deleteButton.onclick = function() {
    onDeleteTodo(todoId);
  };
  metaContainer.appendChild(deleteButton);

  todoElement.appendChild(inputElement);
  todoElement.appendChild(labelElement);
  todoElement.appendChild(metaContainer);
  todoItemsContainer.appendChild(todoElement);
}

function onTodoStatusChange(checkboxId, labelId, todoId) {
  let checkboxElement = document.getElementById(checkboxId);
  let labelElement = document.getElementById(labelId);
  labelElement.classList.toggle("checked");

  let todoObjectIndex = todoList.findIndex(function(eachTodo) {
    let eachTodoId = "todo" + eachTodo.uniqueNo;
    return eachTodoId === todoId;
  });

  todoList[todoObjectIndex].isChecked = !todoList[todoObjectIndex].isChecked;
  updateProgress();
}

function onDeleteTodo(todoId) {
  let todoElement = document.getElementById(todoId);
  todoElement.style.transform = 'translateX(-100px)';
  todoElement.style.opacity = '0';
  
  setTimeout(() => {
    todoItemsContainer.removeChild(todoElement);
    let deleteElementIndex = todoList.findIndex(function(eachTodo) {
      let eachTodoId = "todo" + eachTodo.uniqueNo;
      return eachTodoId === todoId;
    });
    todoList.splice(deleteElementIndex, 1);
    updateProgress();
  }, 300);
}

// Initialize progress
updateProgress();

for (let todo of todoList) {
  createAndAppendTodo(todo);
}
