import os
import json

def validate_json(json_data):
    try:
        # Parse the JSON data
        data = json.loads(json_data)
        # Convert back to JSON string to ensure it's valid
        valid_json = json.dumps(data, indent=2)
        print("JSON is valid.")
        print("Formatted JSON:")
        print(valid_json)
        return valid_json
    except json.JSONDecodeError as e:
        print(f"JSON is invalid: {e}")

def create_files_from_response(response, parent_directory):
    # Assuming response is in JSON format
    try:
        file_data_list = json.loads(response)
        
        for file_data in file_data_list:
            file_name = parent_directory + file_data.get("file_name")
            content = file_data.get("content", "")
            
            # Ensure the directory exists (if file_name includes directories)
            directory = os.path.dirname(file_name)
            if directory and not os.path.exists(directory):
                os.makedirs(directory)
            
            # Create the file and write content
            with open(file_name, "w") as f:
                f.write(content)
            print(f"File '{file_name}' created.")
            
    except json.JSONDecodeError:
        print("Invalid response format. Please provide valid JSON.")

# Example usage:
response = '''
[
  {
    "file_name": "index.html",
    "content": "<!DOCTYPE html>\\n<html lang=\\"en\\">\\n<head>\\n    <meta charset=\\"UTF-8\\">\\n    <meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">\\n    <title>To-Do List with Dependencies</title>\\n    <link href=\\"https://stackpath.bootstrapcdn.com/bootstrap/5.3.0/css/bootstrap.min.css\\" rel=\\"stylesheet\\">\\n    <link rel=\\"stylesheet\\" href=\\"styles.css\\">\\n</head>\\n<body>\\n    <div class=\\"container mt-5\\">\\n        <h1 class=\\"mb-4\\">To-Do List</h1>\\n        <div class=\\"row\\">\\n            <div class=\\"col-md-6\\">\\n                <h2>To-Do Items</h2>\\n                <ul id=\\"todo-list\\" class=\\"list-group\\">\\n                    <!-- To-Do items will be injected here -->\\n                </ul>\\n                <form id=\\"add-todo-form\\" class=\\"mt-4\\">\\n                    <div class=\\"mb-3\\">\\n                        <label for=\\"todo-name\\" class=\\"form-label\\">To-Do Name</label>\\n                        <input type=\\"text\\" class=\\"form-control\\" id=\\"todo-name\\" required>\\n                    </div>\\n                    <div class=\\"mb-3\\">\\n                        <label for=\\"todo-dependency\\" class=\\"form-label\\">Dependency (optional)</label>\\n                        <input type=\\"text\\" class=\\"form-control\\" id=\\"todo-dependency\\">\\n                    </div>\\n                    <button type=\\"submit\\" class=\\"btn btn-primary\\">Add To-Do</button>\\n                </form>\\n            </div>\\n        </div>\\n    </div>\\n    <script src=\\"script.js\\"></script>\\n    <script src=\\"https://stackpath.bootstrapcdn.com/bootstrap/5.3.0/js/bootstrap.bundle.min.js\\"></script>\\n</body>\\n</html>"
  },
  {
    "file_name": "styles.css",
    "content": "body {\\n    background-color: #f8f9fa;\\n}\\n.container {\\n    max-width: 800px;\\n}\\n.list-group-item {\\n    display: flex;\\n    justify-content: space-between;\\n    align-items: center;\\n}\\n.completed {\\n    text-decoration: line-through;\\n}\\n"
  },
  {
    "file_name": "script.js",
    "content": "document.addEventListener('DOMContentLoaded', () => {\\n    const todoList = document.getElementById('todo-list');\\n    const addTodoForm = document.getElementById('add-todo-form');\\n    const todoNameInput = document.getElementById('todo-name');\\n    const todoDependencyInput = document.getElementById('todo-dependency');\\n\\n    const todos = [];\\n\\n    function renderTodos() {\\n        todoList.innerHTML = '';\\n        todos.forEach((todo, index) => {\\n            const li = document.createElement('li');\\n            li.className = 'list-group-item';\\n            li.innerHTML = `<span class=\\"${todo.completed ? 'completed' : ''}\\">${todo.name}</span> <button class=\\"btn btn-success btn-sm\\" onclick=\\"markAsComplete(${index})\\">Complete</button>`;\\n            todoList.appendChild(li);\\n        });\\n    }\\n\\n    function markAsComplete(index) {\\n        todos[index].completed = true;\\n        renderTodos();\\n    }\\n\\n    addTodoForm.addEventListener('submit', (event) => {\\n        event.preventDefault();\\n        const name = todoNameInput.value;\\n        const dependency = todoDependencyInput.value;\\n\\n        if (dependency && !todos.find(todo => todo.name === dependency)) {\\n            alert('Dependency not found!');\\n            return;\\n        }\\n\\n        todos.push({ name, completed: false, dependency });\\n        todoNameInput.value = '';\\n        todoDependencyInput.value = '';\\n        renderTodos();\\n    });\\n\\n    renderTodos();\\n});"
  }
]
'''

create_files_from_response(response, "prototype-file-setup/test/")
