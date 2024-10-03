import requests
from datetime import datetime, timedelta

# Replace this with your Todoist API token
API_TOKEN = '2001d2f1c144be2ee3adf65f87031a2f3ec3daa6'

# Todoist API base URL
BASE_URL = 'https://api.todoist.com/rest/v2/'

# Function to fetch tasks from Todoist
def fetch_tasks():
    headers = {
        'Authorization': f'Bearer {API_TOKEN}',
    }
    response = requests.get(f'{BASE_URL}tasks', headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return []

# Function to list tasks within a specific time period
def list_tasks_within_time_period(start_date, end_date):
    # Fetch all tasks
    tasks = fetch_tasks()

    # Convert start_date and end_date to datetime objects
    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    # Filter tasks based on due dates
    filtered_tasks = []
    for task in tasks:
        due_info = task.get('due')
        if due_info:
            due_date_str = due_info.get('date')
            if due_date_str:
                due_date = datetime.strptime(due_date_str.split('T')[0], "%Y-%m-%d")
                if start_date <= due_date <= end_date:
                    filtered_tasks.append(task)

    # Print the filtered tasks
    if filtered_tasks:
        for task in filtered_tasks:
            print(f"Task: {task['content']}, Due: {task['due']['date']}")
    else:
        print("No tasks found in the specified time period.")

# Specify the time period
start_date = '2024-09-14'  # Start date (YYYY-MM-DD)
end_date = '2024-09-21'    # End date (YYYY-MM-DD)

# List tasks within the specified period
list_tasks_within_time_period(start_date, end_date)
